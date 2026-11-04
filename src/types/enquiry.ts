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

export type QuantityRange =
  | "Below 50"
  | "50–100"
  | "100–200"
  | "200–500"
  | "Above 500";

export interface EnquiryPayload {
  name: string;
  phone: string;
  email?: string;
  organisation?: string;
  requirement_type: RequirementType;
  requirement_other?: string;
  food_preference: FoodPreference;
  food_other?: string;
  quantity?: string;
  quantity_range?: QuantityRange | string;
  event_date?: string;
  location: string;
  additional_requirements?: string;
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
