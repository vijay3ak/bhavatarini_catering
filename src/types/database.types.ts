export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      enquiries: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          phone: string;
          organisation: string | null;
          requirement_type: string;
          food_preference: string;
          quantity_range: string;
          details: string | null;
          status: string;
          internal_notes: string | null;
          whatsapp_initiated: boolean;
          email_notification_sent: boolean;
          ip_hash: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          phone: string;
          organisation?: string | null;
          requirement_type: string;
          food_preference: string;
          quantity_range: string;
          details?: string | null;
          status?: string;
          internal_notes?: string | null;
          whatsapp_initiated?: boolean;
          email_notification_sent?: boolean;
          ip_hash?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          phone?: string;
          organisation?: string | null;
          requirement_type?: string;
          food_preference?: string;
          quantity_range?: string;
          details?: string | null;
          status?: string;
          internal_notes?: string | null;
          whatsapp_initiated?: boolean;
          email_notification_sent?: boolean;
          ip_hash?: string | null;
          user_agent?: string | null;
        };
      };
      admin_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: string;
          created_at?: string;
        };
      };
    };
  };
}
