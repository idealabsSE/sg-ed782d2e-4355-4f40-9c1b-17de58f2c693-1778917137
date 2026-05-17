 
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id: string
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      case_parties: {
        Row: {
          case_id: string
          id: string
          invited_at: string | null
          role: string
          user_id: string | null
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          case_id: string
          id?: string
          invited_at?: string | null
          role: string
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          case_id?: string
          id?: string
          invited_at?: string | null
          role?: string
          user_id?: string | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_parties_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_parties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          case_number: string | null
          created_at: string | null
          created_by: string | null
          id: string
          organization_id: string | null
          property_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          case_number?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          organization_id?: string | null
          property_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          case_number?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          organization_id?: string | null
          property_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_metadata: {
        Row: {
          config: Json | null
          consecutive_failures: number
          created_at: string
          health_status: string
          id: string
          last_failure_at: string | null
          last_success_at: string | null
          source: string
          total_records_ingested: number
          total_runs: number
          updated_at: string
        }
        Insert: {
          config?: Json | null
          consecutive_failures?: number
          created_at?: string
          health_status?: string
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          source: string
          total_records_ingested?: number
          total_runs?: number
          updated_at?: string
        }
        Update: {
          config?: Json | null
          consecutive_failures?: number
          created_at?: string
          health_status?: string
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          source?: string
          total_records_ingested?: number
          total_runs?: number
          updated_at?: string
        }
        Relationships: []
      }
      consent_records: {
        Row: {
          consent_method: string
          consent_type: string
          created_at: string
          granted: boolean
          granted_at: string | null
          id: string
          ip_address: string | null
          purpose: string
          updated_at: string
          user_agent: string | null
          user_id: string
          withdrawn_at: string | null
        }
        Insert: {
          consent_method: string
          consent_type: string
          created_at?: string
          granted: boolean
          granted_at?: string | null
          id?: string
          ip_address?: string | null
          purpose: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
          withdrawn_at?: string | null
        }
        Update: {
          consent_method?: string
          consent_type?: string
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_address?: string | null
          purpose?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      data_processing_records: {
        Row: {
          activity_name: string
          created_at: string
          data_categories: string[]
          data_subjects: string[]
          id: string
          is_active: boolean
          legal_basis: string
          purpose: string
          recipients: string[] | null
          retention_period: string
          security_measures: string
          transfer_safeguards: string | null
          transfers_outside_eu: boolean
          updated_at: string
        }
        Insert: {
          activity_name: string
          created_at?: string
          data_categories: string[]
          data_subjects: string[]
          id?: string
          is_active?: boolean
          legal_basis: string
          purpose: string
          recipients?: string[] | null
          retention_period: string
          security_measures: string
          transfer_safeguards?: string | null
          transfers_outside_eu?: boolean
          updated_at?: string
        }
        Update: {
          activity_name?: string
          created_at?: string
          data_categories?: string[]
          data_subjects?: string[]
          id?: string
          is_active?: boolean
          legal_basis?: string
          purpose?: string
          recipients?: string[] | null
          retention_period?: string
          security_measures?: string
          transfer_safeguards?: string | null
          transfers_outside_eu?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      data_subject_requests: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          deadline: string
          id: string
          notes: string | null
          rejection_reason: string | null
          request_type: string
          requester_email: string
          requester_id: string | null
          response_data: Json | null
          status: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          deadline: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          request_type: string
          requester_email: string
          requester_id?: string | null
          response_data?: Json | null
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          deadline?: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          request_type?: string
          requester_email?: string
          requester_id?: string | null
          response_data?: Json | null
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_subject_requests_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_subject_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          invited_at: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_at?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          invited_at?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "organization_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_roles: {
        Row: {
          created_at: string
          id: string
          is_system_role: boolean
          name: string
          organization_id: string
          permissions: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_system_role?: boolean
          name: string
          organization_id: string
          permissions?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_system_role?: boolean
          name?: string
          organization_id?: string
          permissions?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          branding: Json | null
          created_at: string
          created_by: string
          id: string
          locale: string
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          branding?: Json | null
          created_at?: string
          created_by: string
          id?: string
          locale?: string
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          branding?: Json | null
          created_at?: string
          created_by?: string
          id?: string
          locale?: string
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ownership_documents: {
        Row: {
          created_at: string | null
          document_url: string
          id: string
          match_status: string | null
          owner_name: string | null
          property_id: string
          registry_data: Json | null
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          document_url: string
          id?: string
          match_status?: string | null
          owner_name?: string | null
          property_id: string
          registry_data?: Json | null
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          document_url?: string
          id?: string
          match_status?: string | null
          owner_name?: string | null
          property_id?: string
          registry_data?: Json | null
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "ownership_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ownership_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          cadastral_reference: string
          created_at: string | null
          id: string
          license_number: string | null
          license_status: string | null
          organization_id: string | null
          region: string
          updated_at: string | null
        }
        Insert: {
          address: string
          cadastral_reference: string
          created_at?: string | null
          id?: string
          license_number?: string | null
          license_status?: string | null
          organization_id?: string | null
          region: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          cadastral_reference?: string
          created_at?: string | null
          id?: string
          license_number?: string | null
          license_status?: string | null
          organization_id?: string | null
          region?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      regional_licenses: {
        Row: {
          address: string | null
          beds: number | null
          cadastral_reference: string | null
          capacity: number | null
          created_at: string
          first_seen_at: string
          id: string
          last_verified_at: string
          license_number: string
          license_type: string | null
          municipality: string | null
          raw_data: Json | null
          region: string
          source: string
          source_id: string
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          beds?: number | null
          cadastral_reference?: string | null
          capacity?: number | null
          created_at?: string
          first_seen_at?: string
          id?: string
          last_verified_at?: string
          license_number: string
          license_type?: string | null
          municipality?: string | null
          raw_data?: Json | null
          region?: string
          source?: string
          source_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          beds?: number | null
          cadastral_reference?: string | null
          capacity?: number | null
          created_at?: string
          first_seen_at?: string
          id?: string
          last_verified_at?: string
          license_number?: string
          license_type?: string | null
          municipality?: string | null
          raw_data?: Json | null
          region?: string
          source?: string
          source_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      retention_policies: {
        Row: {
          created_at: string
          data_category: string
          deletion_method: string
          id: string
          is_active: boolean
          last_sweep_at: string | null
          legal_basis: string
          retention_period_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_category: string
          deletion_method: string
          id?: string
          is_active?: boolean
          last_sweep_at?: string | null
          legal_basis: string
          retention_period_days: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_category?: string
          deletion_method?: string
          id?: string
          is_active?: boolean
          last_sweep_at?: string | null
          legal_basis?: string
          retention_period_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      security_incidents: {
        Row: {
          affected_user_id: string | null
          created_at: string
          description: string
          detected_by: string | null
          id: string
          incident_type: string
          metadata: Json | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          affected_user_id?: string | null
          created_at?: string
          description: string
          detected_by?: string | null
          id?: string
          incident_type: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string
          updated_at?: string
        }
        Update: {
          affected_user_id?: string | null
          created_at?: string
          description?: string
          detected_by?: string | null
          id?: string
          incident_type?: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_incidents_affected_user_id_fkey"
            columns: ["affected_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_incidents_detected_by_fkey"
            columns: ["detected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_incidents_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_review_records: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          audit_log_entries_reviewed: number | null
          created_at: string
          findings: string
          id: string
          incidents_reviewed: number | null
          recommendations: string | null
          review_period_end: string
          review_period_start: string
          review_type: string
          reviewer_id: string
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          audit_log_entries_reviewed?: number | null
          created_at?: string
          findings: string
          id?: string
          incidents_reviewed?: number | null
          recommendations?: string | null
          review_period_end: string
          review_period_start: string
          review_type: string
          reviewer_id: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          audit_log_entries_reviewed?: number | null
          created_at?: string
          findings?: string
          id?: string
          incidents_reviewed?: number | null
          recommendations?: string | null
          review_period_end?: string
          review_period_start?: string
          review_type?: string
          reviewer_id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_review_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_review_records_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      source_snapshots: {
        Row: {
          created_at: string
          errors: Json | null
          id: string
          records_fetched: number
          records_new: number
          records_removed: number
          records_updated: number
          run_at: string
          snapshot_hash: string | null
          source: string
        }
        Insert: {
          created_at?: string
          errors?: Json | null
          id?: string
          records_fetched: number
          records_new?: number
          records_removed?: number
          records_updated?: number
          run_at?: string
          snapshot_hash?: string | null
          source: string
        }
        Update: {
          created_at?: string
          errors?: Json | null
          id?: string
          records_fetched?: number
          records_new?: number
          records_removed?: number
          records_updated?: number
          run_at?: string
          snapshot_hash?: string | null
          source?: string
        }
        Relationships: []
      }
      vendor_registry: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          created_at: string
          data_categories: string[]
          dpa_expires_date: string | null
          dpa_signed: boolean
          dpa_signed_date: string | null
          eu_based: boolean
          id: string
          last_audit_date: string | null
          next_audit_date: string | null
          notes: string | null
          privacy_policy_url: string | null
          security_certifications: string[] | null
          service_provided: string
          status: string
          updated_at: string
          vendor_name: string
          vendor_type: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          data_categories: string[]
          dpa_expires_date?: string | null
          dpa_signed?: boolean
          dpa_signed_date?: string | null
          eu_based?: boolean
          id?: string
          last_audit_date?: string | null
          next_audit_date?: string | null
          notes?: string | null
          privacy_policy_url?: string | null
          security_certifications?: string[] | null
          service_provided: string
          status?: string
          updated_at?: string
          vendor_name: string
          vendor_type: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          data_categories?: string[]
          dpa_expires_date?: string | null
          dpa_signed?: boolean
          dpa_signed_date?: string | null
          eu_based?: boolean
          id?: string
          last_audit_date?: string | null
          next_audit_date?: string | null
          notes?: string | null
          privacy_policy_url?: string | null
          security_certifications?: string[] | null
          service_provided?: string
          status?: string
          updated_at?: string
          vendor_name?: string
          vendor_type?: string
        }
        Relationships: []
      }
      verifications: {
        Row: {
          country: string
          created_at: string | null
          document_number: string
          document_type: string
          document_url: string | null
          id: string
          identity_data: Json | null
          notes: string | null
          provider_confidence: number | null
          provider_name: string | null
          provider_raw_response: Json | null
          provider_session_id: string | null
          role: string
          status: string | null
          updated_at: string | null
          user_id: string
          verification_method: string | null
          verified_at: string | null
        }
        Insert: {
          country: string
          created_at?: string | null
          document_number: string
          document_type: string
          document_url?: string | null
          id?: string
          identity_data?: Json | null
          notes?: string | null
          provider_confidence?: number | null
          provider_name?: string | null
          provider_raw_response?: Json | null
          provider_session_id?: string | null
          role: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          verification_method?: string | null
          verified_at?: string | null
        }
        Update: {
          country?: string
          created_at?: string | null
          document_number?: string
          document_type?: string
          document_url?: string | null
          id?: string
          identity_data?: Json | null
          notes?: string | null
          provider_confidence?: number | null
          provider_name?: string | null
          provider_raw_response?: Json | null
          provider_session_id?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          verification_method?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
