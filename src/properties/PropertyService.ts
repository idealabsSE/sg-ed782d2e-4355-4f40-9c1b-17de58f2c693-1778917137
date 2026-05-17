import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];
type PropertyInsert = Database["public"]["Tables"]["properties"]["Insert"];

interface SpotCheckResult {
  success: boolean;
  licenseNumber: string;
  region: string;
  status: "active" | "inactive" | "not_found" | "error";
  lastChecked: string;
  details?: {
    holder?: string;
    validFrom?: string;
    validUntil?: string;
    address?: string;
  };
  error?: string;
}

export const propertyService = {
  /**
   * Search for a property by cadastral reference or address
   */
  async searchProperty(query: {
    cadastralReference?: string;
    address?: string;
  }): Promise<{ data: Property | null; error: Error | null }> {
    try {
      let queryBuilder = supabase.from("properties").select("*");

      if (query.cadastralReference) {
        queryBuilder = queryBuilder.eq(
          "cadastral_reference",
          query.cadastralReference
        );
      } else if (query.address) {
        queryBuilder = queryBuilder.ilike("address", `%${query.address}%`);
      }

      const { data, error } = await queryBuilder.maybeSingle();

      console.log("propertyService.searchProperty:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      console.error("propertyService.searchProperty error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Create a new property record
   */
  async createProperty(
    property: PropertyInsert
  ): Promise<{ data: Property | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("properties")
        .insert(property)
        .select()
        .single();

      console.log("propertyService.createProperty:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      console.error("propertyService.createProperty error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Get property by ID
   */
  async getPropertyById(
    id: string
  ): Promise<{ data: Property | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      console.log("propertyService.getPropertyById:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      console.error("propertyService.getPropertyById error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Update property license status
   */
  async updateLicenseStatus(
    propertyId: string,
    licenseStatus: string,
    licenseNumber?: string
  ): Promise<{ data: Property | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("properties")
        .update({
          license_status: licenseStatus,
          license_number: licenseNumber,
        })
        .eq("id", propertyId)
        .select()
        .single();

      console.log("propertyService.updateLicenseStatus:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      console.error("propertyService.updateLicenseStatus error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },

  /**
   * Perform a live SForms spot-check for a property license
   */
  async performSpotCheck(
    propertyId: string,
    licenseNumber: string,
    region: string
  ): Promise<{ data: SpotCheckResult | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.functions.invoke("sforms-spot-check", {
        body: {
          licenseNumber,
          region,
          propertyId,
        },
      });

      console.log("propertyService.performSpotCheck:", { data, error });

      if (error) {
        return { data: null, error: new Error(error.message) };
      }

      return { data, error: null };
    } catch (err) {
      console.error("propertyService.performSpotCheck error:", err);
      return {
        data: null,
        error: err instanceof Error ? err : new Error("Unknown error"),
      };
    }
  },
};