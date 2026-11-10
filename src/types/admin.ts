export interface AdminNavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
  isExternal?: boolean;
}

export interface AdminNavGroup {
  groupTitle: string;
  items: AdminNavItem[];
}

export interface AdminUserPreview {
  name: string;
  role: string;
  email: string;
  avatarText: string;
}

export interface AdminDashboardModuleCard {
  id: string;
  title: string;
  description: string;
  href: string;
  iconName: string;
  statusBadge: string;
  badgeVariant: "active" | "planned" | "foundation";
}

export type CustomerContractStatus =
  | "Active Daily Contract"
  | "Periodic Orders"
  | "In Review"
  | "Archived";

export type CustomerPresetContract =
  | "BREAKFAST & DINNER"
  | "LUNCH"
  | "CUSTOM";

export interface CustomerAddressRecord {
  id: string;
  address_type: "billing" | "delivery";
  address_line: string;
  city: string;
  pincode: string | null;
  is_default: boolean;
}

export interface CustomerContactRecord {
  id: string;
  contact_name: string;
  phone: string;
  email: string | null;
  designation: string | null;
  is_primary: boolean;
}

export interface CustomerRecord {
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
  customer_addresses?: CustomerAddressRecord[] | null;
  customer_contacts?: CustomerContactRecord[] | null;
}

export interface CorporateCustomer {
  id: string;
  name: string;
  shortCode: string;
  billingAddress: string;
  deliveryLocation: string;
  gstin: string;
  pan: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  contractStatus: CustomerContractStatus;
  defaultPreset: CustomerPresetContract;
  defaultRate: number;
  notes?: string;
  activeContractsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: "enquiry" | "billing" | "customer" | "system";
  badgeText?: string;
  badgeVariant?: "gold" | "green" | "blue" | "neutral";
}

export interface AdminKpiMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newEnquiries: number;
  pendingEnquiries: number;
  isSampleData: boolean;
}
