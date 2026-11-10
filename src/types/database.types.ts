export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AdminRole = "owner" | "admin" | "staff";

export type EnquiryStatus =
  | "new"
  | "contacted"
  | "quote_sent"
  | "confirmed"
  | "completed"
  | "cancelled";

export type RequirementType =
  | "Corporate office"
  | "Startup / team"
  | "Small function"
  | "Group gathering"
  | "Others";

export type FoodPreference =
  | "Full meals"
  | "Customised tiffin"
  | "Both meals and tiffin"
  | "Others";

export type CustomerContractStatus =
  | "Active Daily Contract"
  | "Periodic Orders"
  | "In Review"
  | "Archived";

export type NotificationChannel = "email" | "whatsapp" | "sms";

export type NotificationStatus = "pending" | "processing" | "sent" | "failed";

export type InvoiceStatus = "DRAFT" | "ISSUED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export type AuditAction =
  | "INSERT"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "ROLE_CHANGE"
  | "EXPORT";
export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role_id: string
          token_hash: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role_id: string
          token_hash: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role_id?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["role_id"]
          },
        ]
      }
      admin_profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          role_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          last_login_at?: string | null
          role_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          role_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["role_id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          created_at: string
          description: string
          role_id: string
          role_name: string
        }
        Insert: {
          created_at?: string
          description: string
          role_id: string
          role_name: string
        }
        Update: {
          created_at?: string
          description?: string
          role_id?: string
          role_name?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_name: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_name: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_name?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_operations: {
        Row: {
          id: string
          lead_time_hours: number | null
          max_headcount: number | null
          min_headcount: number | null
          service_areas: string | null
          service_end_time: string | null
          service_start_time: string | null
          settings_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_time_hours?: number | null
          max_headcount?: number | null
          min_headcount?: number | null
          service_areas?: string | null
          service_end_time?: string | null
          service_start_time?: string | null
          settings_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_time_hours?: number | null
          max_headcount?: number | null
          min_headcount?: number | null
          service_areas?: string | null
          service_end_time?: string | null
          service_start_time?: string | null
          settings_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_operations_settings_id_fkey"
            columns: ["settings_id"]
            isOneToOne: false
            referencedRelation: "business_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          bank_details: Json | null
          brand_name: string | null
          gstin: string | null
          id: string
          invoice_terms: string | null
          legal_name: string | null
          official_email: string | null
          pan: string | null
          primary_phone: string | null
          updated_at: string
          updated_by: string | null
          whatsapp_number: string | null
        }
        Insert: {
          bank_details?: Json | null
          brand_name?: string | null
          gstin?: string | null
          id?: string
          invoice_terms?: string | null
          legal_name?: string | null
          official_email?: string | null
          pan?: string | null
          primary_phone?: string | null
          updated_at?: string
          updated_by?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          bank_details?: Json | null
          brand_name?: string | null
          gstin?: string | null
          id?: string
          invoice_terms?: string | null
          legal_name?: string | null
          official_email?: string | null
          pan?: string | null
          primary_phone?: string | null
          updated_at?: string
          updated_by?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          address_line: string
          address_type: string
          city: string
          created_at: string
          customer_id: string
          id: string
          is_default: boolean
          pincode: string | null
          updated_at: string
        }
        Insert: {
          address_line: string
          address_type?: string
          city?: string
          created_at?: string
          customer_id: string
          id?: string
          is_default?: boolean
          pincode?: string | null
          updated_at?: string
        }
        Update: {
          address_line?: string
          address_type?: string
          city?: string
          created_at?: string
          customer_id?: string
          id?: string
          is_default?: boolean
          pincode?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          contact_name: string
          created_at: string
          customer_id: string
          designation: string | null
          email: string | null
          id: string
          is_primary: boolean
          phone: string
          updated_at: string
        }
        Insert: {
          contact_name: string
          created_at?: string
          customer_id: string
          designation?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          phone: string
          updated_at?: string
        }
        Update: {
          contact_name?: string
          created_at?: string
          customer_id?: string
          designation?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          company_name: string
          contract_status: string
          created_at: string
          customer_code: string
          default_preset: string | null
          default_rate: number | null
          gstin: string | null
          id: string
          notes: string | null
          pan: string | null
          updated_at: string
        }
        Insert: {
          company_name: string
          contract_status?: string
          created_at?: string
          customer_code: string
          default_preset?: string | null
          default_rate?: number | null
          gstin?: string | null
          id?: string
          notes?: string | null
          pan?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          contract_status?: string
          created_at?: string
          customer_code?: string
          default_preset?: string | null
          default_rate?: number | null
          gstin?: string | null
          id?: string
          notes?: string | null
          pan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          converted_customer_id: string | null
          created_at: string
          details: string | null
          email: string | null
          enquiry_number: string
          event_date: string | null
          food_preference: string
          id: string
          ip_hash: string | null
          location: string
          name: string
          organisation: string | null
          phone: string
          quantity_range: string
          requirement_type: string
          status: string
          updated_at: string
          user_agent: string | null
          whatsapp_initiated: boolean
        }
        Insert: {
          converted_customer_id?: string | null
          created_at?: string
          details?: string | null
          email?: string | null
          enquiry_number: string
          event_date?: string | null
          food_preference: string
          id?: string
          ip_hash?: string | null
          location: string
          name: string
          organisation?: string | null
          phone: string
          quantity_range: string
          requirement_type: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          whatsapp_initiated?: boolean
        }
        Update: {
          converted_customer_id?: string | null
          created_at?: string
          details?: string | null
          email?: string | null
          enquiry_number?: string
          event_date?: string | null
          food_preference?: string
          id?: string
          ip_hash?: string | null
          location?: string
          name?: string
          organisation?: string | null
          phone?: string
          quantity_range?: string
          requirement_type?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          whatsapp_initiated?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_converted_customer_id_fkey"
            columns: ["converted_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiry_notes: {
        Row: {
          author_id: string
          created_at: string
          enquiry_id: string
          id: string
          note_text: string
        }
        Insert: {
          author_id: string
          created_at?: string
          enquiry_id: string
          id?: string
          note_text: string
        }
        Update: {
          author_id?: string
          created_at?: string
          enquiry_id?: string
          id?: string
          note_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquiry_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiry_notes_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiry_status_history: {
        Row: {
          changed_by: string
          created_at: string
          enquiry_id: string
          id: string
          new_status: string
          old_status: string
          reason: string | null
        }
        Insert: {
          changed_by: string
          created_at?: string
          enquiry_id: string
          id?: string
          new_status: string
          old_status: string
          reason?: string | null
        }
        Update: {
          changed_by?: string
          created_at?: string
          enquiry_id?: string
          id?: string
          new_status?: string
          old_status?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiry_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiry_status_history_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_daily_entries: {
        Row: {
          bill_qty: number
          breakfast: number
          combined_notation: string | null
          created_at: string
          daily_amount: number
          day_name: string
          day_number: number
          dinner: number
          entry_date: string
          id: string
          invoice_id: string
          is_manual_particulars: boolean
          is_sunday: boolean
          lunch: number
          particulars: string
          remarks: string | null
          snacks: number
          tea: number
        }
        Insert: {
          bill_qty?: number
          breakfast?: number
          combined_notation?: string | null
          created_at?: string
          daily_amount?: number
          day_name: string
          day_number: number
          dinner?: number
          entry_date: string
          id?: string
          invoice_id: string
          is_manual_particulars?: boolean
          is_sunday?: boolean
          lunch?: number
          particulars?: string
          remarks?: string | null
          snacks?: number
          tea?: number
        }
        Update: {
          bill_qty?: number
          breakfast?: number
          combined_notation?: string | null
          created_at?: string
          daily_amount?: number
          day_name?: string
          day_number?: number
          dinner?: number
          entry_date?: string
          id?: string
          invoice_id?: string
          is_manual_particulars?: boolean
          is_sunday?: boolean
          lunch?: number
          particulars?: string
          remarks?: string | null
          snacks?: number
          tea?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_daily_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string
          payment_reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_sequences: {
        Row: {
          fiscal_year: string
          last_number: number
          updated_at: string
        }
        Insert: {
          fiscal_year: string
          last_number?: number
          updated_at?: string
        }
        Update: {
          fiscal_year?: string
          last_number?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          active_preset: string
          amount_in_words: string
          billing_month: number
          billing_year: number
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          created_by: string
          customer_id: string
          customer_snapshot: Json | null
          declaration: string | null
          finalized_at: string | null
          finalized_by: string | null
          id: string
          invoice_date: string
          invoice_number: string | null
          notes: string | null
          outstanding_balance: number
          payment_status: string
          period_end_date: string
          period_start_date: string
          rate: number
          rate_source: string
          status: string
          supplier_snapshot: Json | null
          total_amount: number
          total_bill_qty: number
          total_days: number
          total_paid: number
          total_sundays: number
          unit_location: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active_preset?: string
          amount_in_words: string
          billing_month: number
          billing_year: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by: string
          customer_id: string
          customer_snapshot?: Json | null
          declaration?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          invoice_date: string
          invoice_number?: string | null
          notes?: string | null
          outstanding_balance?: number
          payment_status?: string
          period_end_date: string
          period_start_date: string
          rate: number
          rate_source?: string
          status?: string
          supplier_snapshot?: Json | null
          total_amount: number
          total_bill_qty: number
          total_days: number
          total_paid?: number
          total_sundays?: number
          unit_location: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active_preset?: string
          amount_in_words?: string
          billing_month?: number
          billing_year?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string
          customer_snapshot?: Json | null
          declaration?: string | null
          finalized_at?: string | null
          finalized_by?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          notes?: string | null
          outstanding_balance?: number
          payment_status?: string
          period_end_date?: string
          period_start_date?: string
          rate?: number
          rate_source?: string
          status?: string
          supplier_snapshot?: Json | null
          total_amount?: number
          total_bill_qty?: number
          total_days?: number
          total_paid?: number
          total_sundays?: number
          unit_location?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_finalized_by_fkey"
            columns: ["finalized_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_outbox: {
        Row: {
          channel: string
          created_at: string
          enquiry_id: string
          id: string
          last_error: string | null
          max_retries: number
          next_retry_at: string
          payload: Json
          recipient: string
          retry_count: number
          sent_at: string | null
          status: string
          template_name: string
        }
        Insert: {
          channel?: string
          created_at?: string
          enquiry_id: string
          id?: string
          last_error?: string | null
          max_retries?: number
          next_retry_at?: string
          payload: Json
          recipient: string
          retry_count?: number
          sent_at?: string | null
          status?: string
          template_name: string
        }
        Update: {
          channel?: string
          created_at?: string
          enquiry_id?: string
          id?: string
          last_error?: string | null
          max_retries?: number
          next_retry_at?: string
          payload?: Json
          recipient?: string
          retry_count?: number
          sent_at?: string | null
          status?: string
          template_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_outbox_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          alert_emails: string[] | null
          id: string
          notify_on_new_enquiry: boolean
          notify_on_status_change: boolean
          settings_id: string
          updated_at: string
        }
        Insert: {
          alert_emails?: string[] | null
          id?: string
          notify_on_new_enquiry?: boolean
          notify_on_status_change?: boolean
          settings_id: string
          updated_at?: string
        }
        Update: {
          alert_emails?: string[] | null
          id?: string
          notify_on_new_enquiry?: boolean
          notify_on_status_change?: boolean
          settings_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_settings_id_fkey"
            columns: ["settings_id"]
            isOneToOne: false
            referencedRelation: "business_settings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_invoice: {
        Args: { p_invoice_id: string; p_reason: string }
        Returns: boolean
      }
      generate_next_invoice_number: {
        Args: { p_invoice_date?: string }
        Returns: string
      }
      get_current_admin_role: { Args: never; Returns: string }
      get_fiscal_year: { Args: { p_date?: string }; Returns: string }
      issue_invoice: {
        Args: { p_invoice_id: string }
        Returns: {
          active_preset: string
          amount_in_words: string
          billing_month: number
          billing_year: number
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          created_by: string
          customer_id: string
          customer_snapshot: Json | null
          declaration: string | null
          finalized_at: string | null
          finalized_by: string | null
          id: string
          invoice_date: string
          invoice_number: string | null
          notes: string | null
          outstanding_balance: number
          payment_status: string
          period_end_date: string
          period_start_date: string
          rate: number
          rate_source: string
          status: string
          supplier_snapshot: Json | null
          total_amount: number
          total_bill_qty: number
          total_days: number
          total_paid: number
          total_sundays: number
          unit_location: string
          updated_at: string
          updated_by: string | null
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      record_invoice_payment: {
        Args: {
          p_amount: number
          p_invoice_id: string
          p_notes?: string | null
          p_payment_date?: string | null
          p_payment_reference?: string | null
        }
        Returns: string
      }
      save_customer_profile: {
        Args: {
          p_billing_address_id?: string
          p_billing_address_line?: string
          p_billing_city?: string
          p_billing_pincode?: string
          p_clear_contact?: boolean
          p_company_name?: string
          p_contact_designation?: string
          p_contact_email?: string
          p_contact_name?: string
          p_contact_phone?: string
          p_contract_status?: string
          p_customer_code?: string
          p_default_preset?: string
          p_default_rate?: number
          p_delivery_address_id?: string
          p_delivery_address_line?: string
          p_delivery_city?: string
          p_delivery_pincode?: string
          p_gstin?: string
          p_id?: string
          p_notes?: string
          p_pan?: string
        }
        Returns: string
      }
      save_invoice_draft: {
        Args: {
          p_active_preset: string
          p_amount_in_words: string
          p_billing_month: number
          p_billing_year: number
          p_customer_id: string
          p_draft_id?: string | null
          p_entries: Json
          p_invoice_date: string
          p_notes?: string | null
          p_period_end_date: string
          p_period_start_date: string
          p_rate: number
          p_rate_source: string
          p_total_amount: number
          p_total_bill_qty: number
          p_total_days: number
          p_total_sundays: number
          p_unit_location: string
        }
        Returns: string
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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

