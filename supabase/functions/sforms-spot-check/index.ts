import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SpotCheckRequest {
  licenseNumber: string;
  region: string;
  propertyId: string;
}

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

/**
 * Query the GVA SForms interface for a specific license number
 * This is a secondary fallback mechanism, not for bulk ingestion
 */
async function querySForms(licenseNumber: string, region: string): Promise<SpotCheckResult> {
  const timestamp = new Date().toISOString();
  
  try {
    // SForms base URL for Valencia region
    const baseUrl = "https://www.gva.es/es/inicio/procedimientos";
    
    // Encode the search parameters (simplified for demonstration)
    // Real implementation would use proper XML/SOAP parameter encoding
    const searchUrl = `${baseUrl}?id_proc=19744&version=amp&parametro_0=${encodeURIComponent(licenseNumber)}`;
    
    console.log("Querying SForms:", { licenseNumber, region, url: searchUrl });
    
    // Make the HTTP request
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "User-Agent": "XTrust-Verification/1.0",
      },
    });
    
    if (!response.ok) {
      throw new Error(`SForms HTTP error: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML response to extract license validity
    const result = parseHtmlResponse(html, licenseNumber, region, timestamp);
    
    console.log("SForms result:", result);
    return result;
    
  } catch (error) {
    console.error("SForms query error:", error);
    return {
      success: false,
      licenseNumber,
      region,
      status: "error",
      lastChecked: timestamp,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Parse the SForms HTML response to extract license information
 * This is a simplified parser - real implementation would need robust HTML parsing
 */
function parseHtmlResponse(html: string, licenseNumber: string, region: string, timestamp: string): SpotCheckResult {
  // Look for key indicators in the HTML response
  const hasLicenseNumber = html.includes(licenseNumber);
  const hasActiveIndicator = html.includes("ACTIVA") || html.includes("VIGENTE") || html.includes("EN VIGOR");
  const hasInactiveIndicator = html.includes("INACTIVA") || html.includes("REVOCADA") || html.includes("CANCELADA");
  const notFoundIndicator = html.includes("No se han encontrado") || html.includes("Sin resultados");
  
  // Extract basic information using simple regex patterns
  // Real implementation would use a proper HTML parser like cheerio
  let holder: string | undefined;
  let validFrom: string | undefined;
  let validUntil: string | undefined;
  let address: string | undefined;
  
  // Attempt to extract holder name (simplified)
  const holderMatch = html.match(/Titular[:\s]+([^<\n]+)/i);
  if (holderMatch) {
    holder = holderMatch[1].trim();
  }
  
  // Attempt to extract validity dates (simplified)
  const validFromMatch = html.match(/Fecha inicio[:\s]+(\d{2}\/\d{2}\/\d{4})/i);
  if (validFromMatch) {
    validFrom = validFromMatch[1];
  }
  
  const validUntilMatch = html.match(/Fecha fin[:\s]+(\d{2}\/\d{2}\/\d{4})/i);
  if (validUntilMatch) {
    validUntil = validUntilMatch[1];
  }
  
  // Attempt to extract address (simplified)
  const addressMatch = html.match(/Dirección[:\s]+([^<\n]+)/i);
  if (addressMatch) {
    address = addressMatch[1].trim();
  }
  
  // Determine status
  let status: SpotCheckResult["status"];
  if (notFoundIndicator) {
    status = "not_found";
  } else if (hasLicenseNumber && hasActiveIndicator) {
    status = "active";
  } else if (hasLicenseNumber && hasInactiveIndicator) {
    status = "inactive";
  } else if (hasLicenseNumber) {
    // Found but status unclear - default to active if found
    status = "active";
  } else {
    status = "not_found";
  }
  
  const details = (holder || validFrom || validUntil || address) ? {
    holder,
    validFrom,
    validUntil,
    address,
  } : undefined;
  
  return {
    success: status !== "error",
    licenseNumber,
    region,
    status,
    lastChecked: timestamp,
    details,
  };
}

/**
 * Log the spot-check result to audit trail
 */
async function logSpotCheck(
  supabaseClient: any,
  propertyId: string,
  result: SpotCheckResult,
  userId?: string
) {
  try {
    const { error } = await supabaseClient.from("audit_logs").insert({
      event_type: "property_sforms_spot_check",
      user_id: userId,
      entity_type: "property",
      entity_id: propertyId,
      details: {
        license_number: result.licenseNumber,
        region: result.region,
        status: result.status,
        success: result.success,
        last_checked: result.lastChecked,
        details: result.details,
        error: result.error,
      },
    });
    
    if (error) {
      console.error("Failed to log spot-check:", error);
    }
  } catch (error) {
    console.error("Error logging spot-check:", error);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get user from JWT (if available)
    const authHeader = req.headers.get("Authorization");
    let userId: string | undefined;
    
    if (authHeader) {
      const { data: { user } } = await supabaseClient.auth.getUser();
      userId = user?.id;
    }

    const { licenseNumber, region, propertyId }: SpotCheckRequest = await req.json();

    if (!licenseNumber || !region || !propertyId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: licenseNumber, region, propertyId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Perform the spot-check
    const result = await querySForms(licenseNumber, region);

    // Log to audit trail
    await logSpotCheck(supabaseClient, propertyId, result, userId);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});