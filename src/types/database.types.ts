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

export type AuditAction =
  | "INSERT"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "ROLE_CHANGE"
  | "EXPORT";

export interface Database {
  public: {
    Tables: {
      admin_roles: {
        Row: {
          role_id: AdminRole;
          role_name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          role_id: AdminRole;
          role_name: string;
          description: string;
          created_at?: string;
        };
        Update: {
          role_id?: AdminRole;
          role_name?: string;
          description?: string;
          created_at?: string;
        };
      };
      admin_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role_id: AdminRole;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role_id?: AdminRole;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role_id?: AdminRole;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_invitations: {
        Row: {
          id: string;
          email: string;
          role_id: AdminRole;
          token_hash: string;
          invited_by: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role_id: AdminRole;
          token_hash: string;
          invited_by: string;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role_id?: AdminRole;
          token_hash?: string;
          invited_by?: string;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
        };
      };
      enquiries: {
        Row: {
          id: string;
          enquiry_number: string;
          name: string;
          phone: string;
          email: string | null;
          organisation: string | null;
          requirement_type: RequirementType;
          food_preference: FoodPreference;
          quantity_range: string;
          event_date: string | null;
          location: string;
          details: string | null;
          status: EnquiryStatus;
          whatsapp_initiated: boolean;
          converted_customer_id: string | null;
          ip_hash: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          enquiry_number?: string;
          name: string;
          phone: string;
          email?: string | null;
          organisation?: string | null;
          requirement_type: RequirementType;
          food_preference: FoodPreference;
          quantity_range: string;
          event_date?: string | null;
          location: string;
          details?: string | null;
          status?: EnquiryStatus;
          whatsapp_initiated?: boolean;
          converted_customer_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          enquiry_number?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          organisation?: string | null;
          requirement_type?: RequirementType;
          food_preference?: FoodPreference;
          quantity_range?: string;
          event_date?: string | null;
          location?: string;
          details?: string | null;
          status?: EnquiryStatus;
          whatsapp_initiated?: boolean;
          converted_customer_id?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      enquiry_notes: {
        Row: {
          id: string;
          enquiry_id: string;
          author_id: string;
          note_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          enquiry_id: string;
          author_id: string;
          note_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          enquiry_id?: string;
          author_id?: string;
          note_text?: string;
          created_at?: string;
        };
      };
      enquiry_status_history: {
        Row: {
          id: string;
          enquiry_id: string;
          old_status: EnquiryStatus;
          new_status: EnquiryStatus;
          changed_by: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          enquiry_id: string;
          old_status: EnquiryStatus;
          new_status: EnquiryStatus;
          changed_by: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          enquiry_id?: string;
          old_status?: EnquiryStatus;
          new_status?: EnquiryStatus;
          changed_by?: string;
          reason?: string | null;
          created_at?: string;
        };
      };
      notification_outbox: {
        Row: {
          id: string;
          enquiry_id: string;
          channel: NotificationChannel;
          recipient: string;
          template_name: string;
          payload: Json;
          status: NotificationStatus;
          retry_count: number;
          max_retries: number;
          last_error: string | null;
          next_retry_at: string;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          enquiry_id: string;
          channel?: NotificationChannel;
          recipient: string;
          template_name: string;
          payload: Json;
          status?: NotificationStatus;
          retry_count?: number;
          max_retries?: number;
          last_error?: string | null;
          next_retry_at?: string;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          enquiry_id?: string;
          channel?: NotificationChannel;
          recipient?: string;
          template_name?: string;
          payload?: Json;
          status?: NotificationStatus;
          retry_count?: number;
          max_retries?: number;
          last_error?: string | null;
          next_retry_at?: string;
          sent_at?: string | null;
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          customer_code: string;
          company_name: string;
          gstin: string | null;
          pan: string | null;
          contract_status: CustomerContractStatus;
          default_rate: number | null;
          default_preset: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_code: string;
          company_name: string;
          gstin?: string | null;
          pan?: string | null;
          contract_status?: CustomerContractStatus;
          default_rate?: number | null;
          default_preset?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_code?: string;
          company_name?: string;
          gstin?: string | null;
          pan?: string | null;
          contract_status?: CustomerContractStatus;
          default_rate?: number | null;
          default_preset?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customer_contacts: {
        Row: {
          id: string;
          customer_id: string;
          contact_name: string;
          phone: string;
          email: string | null;
          designation: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          contact_name: string;
          phone: string;
          email?: string | null;
          designation?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          contact_name?: string;
          phone?: string;
          email?: string | null;
          designation?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      customer_addresses: {
        Row: {
          id: string;
          customer_id: string;
          address_type: "billing" | "delivery";
          address_line: string;
          city: string;
          pincode: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          address_type?: "billing" | "delivery";
          address_line: string;
          city?: string;
          pincode?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          address_type?: "billing" | "delivery";
          address_line?: string;
          city?: string;
          pincode?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      business_settings: {
        Row: {
          id: string;
          legal_name: string | null;
          brand_name: string | null;
          primary_phone: string | null;
          whatsapp_number: string | null;
          official_email: string | null;
          gstin: string | null;
          pan: string | null;
          bank_details: Json | null;
          invoice_terms: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          legal_name?: string | null;
          brand_name?: string | null;
          primary_phone?: string | null;
          whatsapp_number?: string | null;
          official_email?: string | null;
          gstin?: string | null;
          pan?: string | null;
          bank_details?: Json | null;
          invoice_terms?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          legal_name?: string | null;
          brand_name?: string | null;
          primary_phone?: string | null;
          whatsapp_number?: string | null;
          official_email?: string | null;
          gstin?: string | null;
          pan?: string | null;
          bank_details?: Json | null;
          invoice_terms?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
      business_operations: {
        Row: {
          id: string;
          settings_id: string;
          service_start_time: string | null;
          service_end_time: string | null;
          min_headcount: number | null;
          max_headcount: number | null;
          lead_time_hours: number | null;
          service_areas: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          settings_id: string;
          service_start_time?: string | null;
          service_end_time?: string | null;
          min_headcount?: number | null;
          max_headcount?: number | null;
          lead_time_hours?: number | null;
          service_areas?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          settings_id?: string;
          service_start_time?: string | null;
          service_end_time?: string | null;
          min_headcount?: number | null;
          max_headcount?: number | null;
          lead_time_hours?: number | null;
          service_areas?: string | null;
          updated_at?: string;
        };
      };
      notification_settings: {
        Row: {
          id: string;
          settings_id: string;
          alert_emails: string[] | null;
          notify_on_new_enquiry: boolean;
          notify_on_status_change: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          settings_id: string;
          alert_emails?: string[] | null;
          notify_on_new_enquiry?: boolean;
          notify_on_status_change?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          settings_id?: string;
          alert_emails?: string[] | null;
          notify_on_new_enquiry?: boolean;
          notify_on_status_change?: boolean;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_email: string;
          action: AuditAction;
          entity_name: string;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_email: string;
          action: AuditAction;
          entity_name: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string;
          action?: AuditAction;
          entity_name?: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
