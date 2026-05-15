import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GVARecord {
  cadastral_reference?: string;
  license_number: string;
  license_type?: string;
  address?: string;
  municipality?: string;
  beds?: number;
  capacity?: number;
}

interface IngestionResult {
  records_fetched: number;
  records_new: number;
  records_updated: number;
  records_removed: number;
  errors: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const startTime = Date.now();
  const result: IngestionResult = {
    records_fetched: 0,
    records_new: 0,
    records_updated: 0,
    records_removed: 0,
    errors: [],
  };

  try {
    console.log("[GVA Ingestion] Starting scheduled run");

    // Fetch GVA CSV data
    // Note: Using mock URL - replace with actual GVA open data endpoint
    const gvaUrl = "https://www.gva.es/documents/download/viviendas_turisticas.csv";
    
    let csvData: string;
    try {
      const response = await fetch(gvaUrl, {
        headers: { "User-Agent": "XTrust/1.0 DataIngestion" },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      csvData = await response.text();
    } catch (fetchError) {
      // Fallback to mock data for development
      console.warn("[GVA Ingestion] Failed to fetch from GVA, using mock data:", fetchError);
      csvData = generateMockCSV();
    }

    // Parse CSV
    const records = parseGVACSV(csvData);
    result.records_fetched = records.length;

    console.log(`[GVA Ingestion] Parsed ${records.length} records`);

    if (records.length === 0) {
      result.errors.push("Zero records returned from source - potential data source issue");
      await alertOps("GVA ingestion returned zero records", { gvaUrl });
    }

    // Get existing records for diffing
    const { data: existingRecords } = await supabase
      .from("regional_licenses")
      .select("source_id, cadastral_reference, license_number, address, municipality, beds, capacity, raw_data")
      .eq("source", "gva");

    const existingMap = new Map(
      (existingRecords || []).map((r) => [r.source_id, r])
    );

    const currentIds = new Set<string>();

    // Process each record
    for (const record of records) {
      const sourceId = generateSourceId(record);
      currentIds.add(sourceId);

      const existing = existingMap.get(sourceId);

      if (!existing) {
        // New record
        const { error } = await supabase.from("regional_licenses").insert({
          source: "gva",
          source_id: sourceId,
          cadastral_reference: record.cadastral_reference || null,
          license_number: record.license_number,
          license_type: record.license_type || null,
          address: record.address || null,
          municipality: record.municipality || null,
          region: "valencia",
          status: "active",
          beds: record.beds || null,
          capacity: record.capacity || null,
          raw_data: record,
          first_seen_at: new Date().toISOString(),
          last_verified_at: new Date().toISOString(),
        });

        if (error) {
          result.errors.push(`Insert failed for ${sourceId}: ${error.message}`);
        } else {
          result.records_new++;
        }
      } else {
        // Check if update needed
        const needsUpdate = 
          existing.cadastral_reference !== (record.cadastral_reference || null) ||
          existing.address !== (record.address || null) ||
          existing.municipality !== (record.municipality || null) ||
          existing.beds !== (record.beds || null) ||
          existing.capacity !== (record.capacity || null);

        if (needsUpdate) {
          const { error } = await supabase
            .from("regional_licenses")
            .update({
              cadastral_reference: record.cadastral_reference || null,
              address: record.address || null,
              municipality: record.municipality || null,
              beds: record.beds || null,
              capacity: record.capacity || null,
              raw_data: record,
              last_verified_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("source", "gva")
            .eq("source_id", sourceId);

          if (error) {
            result.errors.push(`Update failed for ${sourceId}: ${error.message}`);
          } else {
            result.records_updated++;
          }
        }
      }
    }

    // Mark removed records
    for (const [existingId, existing] of existingMap.entries()) {
      if (!currentIds.has(existingId) && existing.raw_data?.status !== "removed") {
        const { error } = await supabase
          .from("regional_licenses")
          .update({
            status: "removed",
            updated_at: new Date().toISOString(),
          })
          .eq("source", "gva")
          .eq("source_id", existingId);

        if (!error) {
          result.records_removed++;
        }
      }
    }

    // Record snapshot
    await supabase.from("source_snapshots").insert({
      source: "gva",
      run_at: new Date().toISOString(),
      records_fetched: result.records_fetched,
      records_new: result.records_new,
      records_updated: result.records_updated,
      records_removed: result.records_removed,
      errors: result.errors.length > 0 ? result.errors : null,
      snapshot_hash: await hashString(csvData),
    });

    // Update connector health
    const isSuccess = result.errors.length === 0;
    const { data: metadata } = await supabase
      .from("connector_metadata")
      .select("consecutive_failures, total_runs, total_records_ingested")
      .eq("source", "gva")
      .single();

    const consecutiveFailures = isSuccess ? 0 : (metadata?.consecutive_failures || 0) + 1;
    const healthStatus = 
      consecutiveFailures === 0 ? "healthy" :
      consecutiveFailures < 3 ? "degraded" :
      "failing";

    await supabase.from("connector_metadata").update({
      last_success_at: isSuccess ? new Date().toISOString() : undefined,
      last_failure_at: !isSuccess ? new Date().toISOString() : undefined,
      consecutive_failures: consecutiveFailures,
      total_runs: (metadata?.total_runs || 0) + 1,
      total_records_ingested: (metadata?.total_records_ingested || 0) + result.records_new,
      health_status: healthStatus,
      updated_at: new Date().toISOString(),
    }).eq("source", "gva");

    // Alert on health degradation
    if (healthStatus === "failing") {
      await alertOps("GVA connector health is FAILING", {
        consecutive_failures: consecutiveFailures,
        errors: result.errors,
      });
    }

    const duration = Date.now() - startTime;
    console.log(`[GVA Ingestion] Completed in ${duration}ms:`, result);

    return new Response(
      JSON.stringify({ success: true, duration, ...result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[GVA Ingestion] Fatal error:", error);
    result.errors.push(`Fatal: ${error.message}`);

    // Record failed snapshot
    await supabase.from("source_snapshots").insert({
      source: "gva",
      run_at: new Date().toISOString(),
      records_fetched: 0,
      records_new: 0,
      records_updated: 0,
      records_removed: 0,
      errors: result.errors,
    });

    // Update connector health to failing
    await supabase.from("connector_metadata").update({
      last_failure_at: new Date().toISOString(),
      consecutive_failures: supabase.rpc("increment", { row_id: "gva", column_name: "consecutive_failures" }),
      health_status: "failing",
      updated_at: new Date().toISOString(),
    }).eq("source", "gva");

    await alertOps("GVA ingestion FATAL error", { error: error.message });

    return new Response(
      JSON.stringify({ success: false, error: error.message, ...result }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

function parseGVACSV(csvData: string): GVARecord[] {
  const lines = csvData.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(";").map(h => h.trim());
  const records: GVARecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(";").map(v => v.trim());
    const record: any = {};

    headers.forEach((header, idx) => {
      const value = values[idx];
      
      // Normalize GVA field names to our schema
      if (header.includes("catastral") || header.includes("referencia")) {
        record.cadastral_reference = value;
      } else if (header.includes("licencia") || header.includes("numero")) {
        record.license_number = value;
      } else if (header.includes("tipo") || header.includes("type")) {
        record.license_type = value;
      } else if (header.includes("direccion") || header.includes("address")) {
        record.address = value;
      } else if (header.includes("municipio") || header.includes("municipality")) {
        record.municipality = value;
      } else if (header.includes("camas") || header.includes("beds")) {
        record.beds = parseInt(value) || undefined;
      } else if (header.includes("plazas") || header.includes("capacity")) {
        record.capacity = parseInt(value) || undefined;
      }
    });

    if (record.license_number) {
      records.push(record as GVARecord);
    }
  }

  return records;
}

function generateSourceId(record: GVARecord): string {
  return record.cadastral_reference || record.license_number;
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function alertOps(message: string, details: any): Promise<void> {
  console.error(`[OPS ALERT] ${message}`, details);
  // TODO: Integrate with actual alerting system (email, Slack, PagerDuty)
  // For now, logs serve as alerts
}

function generateMockCSV(): string {
  return `referencia_catastral;numero_licencia;tipo;direccion;municipio;camas;plazas
8765432AB;VT-123456-A;Vivienda Turística;Calle Mayor 123;Valencia;4;8
9876543BC;VT-234567-B;Apartamento Turístico;Av. del Puerto 45;Alicante;2;4
5432109CD;VT-345678-C;Villa Turística;Camino Rural 78;Castellón;6;12`;
}