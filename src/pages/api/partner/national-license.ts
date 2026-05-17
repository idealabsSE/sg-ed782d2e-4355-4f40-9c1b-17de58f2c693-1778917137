import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

interface PartnerNRARequest {
  api_key: string;
  cadastral_reference: string;
  registration_number: string;
  status: "active" | "pending" | "suspended" | "cancelled";
  registered_at?: string;
  expires_at?: string;
  holder_name?: string;
  notes?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body: PartnerNRARequest = req.body;

    if (!body.api_key) {
      return res.status(401).json({ error: "API key required" });
    }

    if (!body.cadastral_reference || !body.registration_number) {
      return res.status(400).json({
        error: "cadastral_reference and registration_number are required",
      });
    }

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id")
      .eq("cadastral_reference", body.cadastral_reference)
      .maybeSingle();

    if (propertyError) {
      return res.status(500).json({ error: propertyError.message });
    }

    if (!property) {
      return res.status(404).json({
        error: "Property not found with given cadastral reference",
      });
    }

    const { data: license, error: licenseError } = await supabase
      .from("national_licenses")
      .upsert(
        {
          property_id: property.id,
          registration_number: body.registration_number,
          status: body.status,
          registered_at: body.registered_at || null,
          expires_at: body.expires_at || null,
          holder_name: body.holder_name || null,
          notes: body.notes || null,
          source: "partner_api",
          last_verified_at: new Date().toISOString(),
        },
        { onConflict: "property_id" }
      )
      .select()
      .single();

    if (licenseError) {
      return res.status(500).json({ error: licenseError.message });
    }

    await supabase.from("access_audit_log").insert({
      user_id: null,
      action: "partner_nra_update",
      resource_type: "national_license",
      resource_id: license.id,
      ip_address: req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || null,
      user_agent: req.headers["user-agent"] || null,
      metadata: {
        cadastral_reference: body.cadastral_reference,
        registration_number: body.registration_number,
        source: "partner_api",
      },
    });

    return res.status(200).json({
      success: true,
      data: license,
    });
  } catch (error) {
    console.error("Partner NRA API error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}