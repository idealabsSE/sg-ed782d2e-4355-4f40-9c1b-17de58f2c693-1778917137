import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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