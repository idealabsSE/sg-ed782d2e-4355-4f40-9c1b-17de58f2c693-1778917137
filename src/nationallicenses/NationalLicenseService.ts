import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { nraConnector } from "@/connectors/nra/NRAConnector";

type NationalLicense = Database["public"]["Tables"]["national_licenses"]["Row"];
type NationalLicenseInsert = Database["public"]["Tables"]["national_licenses"]["Insert"];
type NationalLicenseUpdate = Database["public"]["Tables"]["national_licenses"]["Update"];

export const nationalLicenseService = {
  /**
   * Get national license for a property
   */
  async getByPropertyId(
    propertyId: string
  ): Promise<{ data: NationalLicense | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("national_licenses")
        .select("*")
        .eq("property_id", propertyId)
        .maybeSingle();

      console.log("nationalLicenseService.getByPropertyId:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      console.error("nationalLicenseService.getByPropertyId error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Create manual NRA entry (requires admin review)
   */
  async createManualEntry(
    propertyId: string,
    registrationNumber: string,
    holderName?: string,
    notes?: string
  ): Promise<{ data: NationalLicense | null; error: Error | null }> {
    try {
      const license: NationalLicenseInsert = {
        property_id: propertyId,
        registration_number: registrationNumber,
        status: "manual_entry",
        source: "manual",
        holder_name: holderName || null,
        notes: notes || null,
        requires_review: true,
        pending_automation: true,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("national_licenses")
        .insert(license)
        .select()
        .single();

      console.log("nationalLicenseService.createManualEntry:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      console.error("nationalLicenseService.createManualEntry error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Confirm manual NRA entry (admin/reviewer action)
   */
  async confirmManualEntry(
    propertyId: string,
    reviewerId: string
  ): Promise<{ data: NationalLicense | null; error: Error | null }> {
    try {
      const update: NationalLicenseUpdate = {
        status: "confirmed",
        requires_review: false,
        verified_by: reviewerId,
        nra_verified_at: new Date().toISOString(),
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("national_licenses")
        .update(update)
        .eq("property_id", propertyId)
        .eq("requires_review", true)
        .select()
        .single();

      console.log("nationalLicenseService.confirmManualEntry:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      console.error("nationalLicenseService.confirmManualEntry error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Get all manual entries requiring review
   */
  async getPendingReviews(): Promise<{
    data: NationalLicense[];
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase
        .from("national_licenses")
        .select("*, properties!national_licenses_property_id_fkey(address, cadastral_reference)")
        .eq("requires_review", true)
        .order("created_at", { ascending: false });

      console.log("nationalLicenseService.getPendingReviews:", { data, error });

      if (error) {
        return { data: [], error: new Error(error.message) };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error("nationalLicenseService.getPendingReviews error:", err);
      return {
        data: [],
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Check if property has confirmed NRA registration
   */
  async isNRAConfirmed(propertyId: string): Promise<boolean> {
    const { data } = await this.getByPropertyId(propertyId);
    return data?.status === "confirmed" || data?.status === "active";
  },

  /**
   * Check NRA connector automation status
   */
  getAutomationStatus() {
    return nraConnector.getAutomationStatus();
  },

  /**
   * Create or update national license for a property
   */
  async upsert(
    license: NationalLicenseInsert
  ): Promise<{ data: NationalLicense | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("national_licenses")
        .upsert(license, { onConflict: "property_id" })
        .select()
        .single();

      console.log("nationalLicenseService.upsert:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      console.error("nationalLicenseService.upsert error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Update national license status
   */
  async updateStatus(
    propertyId: string,
    status: string,
    notes?: string
  ): Promise<{ data: NationalLicense | null; error: Error | null }> {
    try {
      const update: NationalLicenseUpdate = {
        status,
        last_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (notes) {
        update.notes = notes;
      }

      const { data, error } = await supabase
        .from("national_licenses")
        .update(update)
        .eq("property_id", propertyId)
        .select()
        .single();

      console.log("nationalLicenseService.updateStatus:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      console.error("nationalLicenseService.updateStatus error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Delete national license
   */
  async delete(
    propertyId: string
  ): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from("national_licenses")
        .delete()
        .eq("property_id", propertyId);

      console.log("nationalLicenseService.delete:", { error });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err) {
      console.error("nationalLicenseService.delete error:", err);
      return {
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },
};