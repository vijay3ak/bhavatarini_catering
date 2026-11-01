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
  | "Group gathering";

export type FoodPreference =
  | "Full meals"
  | "Customised tiffin"
  | "Both meals and tiffin"
  | "Snacks";

export type QuantityRange =
  | "Below 50"
  | "50–100"
  | "100–200"
  | "200–500"
  | "Above 500";

export interface EnquiryPayload {
  name: string;
  phone: string;
  organisation?: string;
  requirement_type: RequirementType;
  food_preference: FoodPreference;
  quantity_range: QuantityRange;
  details?: string;
  honeypot?: string;
}

export interface EnquiryRecord extends EnquiryPayload {
  id: string;
  created_at: string;
  updated_at: string;
  status: EnquiryStatus;
  internal_notes?: string;
  whatsapp_initiated?: boolean;
  email_notification_sent?: boolean;
}
