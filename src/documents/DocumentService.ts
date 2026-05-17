
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type PersonDocument = Database["public"]["Tables"]["person_documents"]["Row"];
type DocumentInsert = Database["public"]["Tables"]["person_documents"]["Insert"];

export interface UploadDocumentParams {
  file: File;
  documentType: "identity" | "financial" | "ownership" | "other";
  verificationId?: string;
}

export interface SignedUrlOptions {
  expiresIn?: number; // seconds, default 3600 (1 hour)
}

export class DocumentService {
  /**
   * Upload a document with validation and metadata tracking
   */
  static async uploadDocument(params: UploadDocumentParams): Promise<PersonDocument> {
    const { file, documentType, verificationId } = params;

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("File size exceeds 10MB limit");
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Only PDF and images are allowed");
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("User must be authenticated to upload documents");
    }

    // Prepare form data for Edge Function
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    if (verificationId) {
      formData.append("verificationId", verificationId);
    }

    // Call upload Edge Function
    const { data, error } = await supabase.functions.invoke("upload-document", {
      body: formData,
    });

    if (error) {
      console.error("Upload error:", error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }

    if (!data.success) {
      throw new Error(data.error || "Upload failed");
    }

    // Log audit event
    await this.logDocumentAccess(data.document.id, "upload");

    return data.document;
  }

  /**
   * Get a signed URL for secure document access with audit logging
   */
  static async getSignedUrl(
    documentId: string,
    options: SignedUrlOptions = {}
  ): Promise<string> {
    const expiresIn = options.expiresIn || 3600; // Default 1 hour

    // Fetch document metadata
    const { data: document, error: fetchError } = await supabase
      .from("person_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (fetchError || !document) {
      throw new Error("Document not found or access denied");
    }

    // Generate signed URL
    const { data, error } = await supabase.storage
      .from("verification-documents")
      .createSignedUrl(document.file_path, expiresIn);

    if (error) {
      console.error("Signed URL error:", error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }

    if (!data.signedUrl) {
      throw new Error("Failed to generate signed URL");
    }

    // Update access tracking (via service role in production)
    await this.updateAccessTracking(documentId);

    // Log audit event
    await this.logDocumentAccess(documentId, "view");

    return data.signedUrl;
  }

  /**
   * Get user's documents with optional filters
   */
  static async getUserDocuments(filters?: {
    documentType?: string;
    verificationId?: string;
  }): Promise<PersonDocument[]> {
    let query = supabase
      .from("person_documents")
      .select("*")
      .order("uploaded_at", { ascending: false });

    if (filters?.documentType) {
      query = query.eq("document_type", filters.documentType);
    }

    if (filters?.verificationId) {
      query = query.eq("verification_id", filters.verificationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch documents error:", error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Delete a document and its storage file
   */
  static async deleteDocument(documentId: string): Promise<void> {
    // Fetch document to get file path
    const { data: document, error: fetchError } = await supabase
      .from("person_documents")
      .select("file_path")
      .eq("id", documentId)
      .single();

    if (fetchError || !document) {
      throw new Error("Document not found or access denied");
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("verification-documents")
      .remove([document.file_path]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      // Continue with DB deletion even if storage fails
    }

    // Delete metadata record
    const { error: dbError } = await supabase
      .from("person_documents")
      .delete()
      .eq("id", documentId);

    if (dbError) {
      console.error("Database delete error:", dbError);
      throw new Error(`Failed to delete document: ${dbError.message}`);
    }

    // Log audit event
    await this.logDocumentAccess(documentId, "delete");
  }

  /**
   * Update document access tracking (last_accessed_at, access_count)
   * This should be called via service role in production
   */
  private static async updateAccessTracking(documentId: string): Promise<void> {
    // This would normally use service role credentials
    // For now, we increment via RPC or separate service
    const { error } = await supabase.rpc("increment_document_access", {
      doc_id: documentId
    });

    if (error) {
      // Non-critical error, just log it
      console.warn("Failed to update access tracking:", error);
    }
  }

  /**
   * Log document access to audit log
   */
  private static async logDocumentAccess(
    documentId: string,
    action: "upload" | "view" | "delete"
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return; // Skip audit logging if no user context
    }

    const { error } = await supabase.from("access_audit_log").insert({
      user_id: user.id,
      resource_type: "document",
      resource_id: documentId,
      action: action,
      ip_address: null, // Could be captured from headers in Edge Function
      user_agent: navigator.userAgent,
      metadata: {
        document_id: documentId,
        action: action
      }
    });

    if (error) {
      console.warn("Audit logging failed:", error);
      // Non-critical, don't throw
    }
  }

  /**
   * Apply retention policy - delete documents past retention date
   * This should be called by a scheduled Edge Function
   */
  static async applyRetentionPolicy(): Promise<number> {
    const { data: expiredDocs, error: fetchError } = await supabase
      .from("person_documents")
      .select("id, file_path")
      .lt("retention_until", new Date().toISOString().split('T')[0])
      .not("retention_until", "is", null);

    if (fetchError) {
      console.error("Fetch expired documents error:", fetchError);
      throw new Error(`Failed to fetch expired documents: ${fetchError.message}`);
    }

    if (!expiredDocs || expiredDocs.length === 0) {
      return 0;
    }

    // Delete from storage
    const filePaths = expiredDocs.map(doc => doc.file_path);
    const { error: storageError } = await supabase.storage
      .from("verification-documents")
      .remove(filePaths);

    if (storageError) {
      console.error("Bulk storage delete error:", storageError);
    }

    // Delete metadata records
    const documentIds = expiredDocs.map(doc => doc.id);
    const { error: dbError } = await supabase
      .from("person_documents")
      .delete()
      .in("id", documentIds);

    if (dbError) {
      console.error("Bulk delete error:", dbError);
      throw new Error(`Failed to delete expired documents: ${dbError.message}`);
    }

    return expiredDocs.length;
  }

  /**
   * Set retention date for a document
   */
  static async setRetentionDate(
    documentId: string,
    retentionDate: Date
  ): Promise<void> {
    const { error } = await supabase
      .from("person_documents")
      .update({ retention_until: retentionDate.toISOString().split('T')[0] })
      .eq("id", documentId);

    if (error) {
      console.error("Set retention date error:", error);
      throw new Error(`Failed to set retention date: ${error.message}`);
    }
  }
}
