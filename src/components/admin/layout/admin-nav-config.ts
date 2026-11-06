import {
  LayoutDashboard,
  Inbox,
  Building2,
  Receipt,
  FileText,
  ScanLine,
  Settings,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

export interface NavLinkItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  isExternal?: boolean;
}

export interface NavGroup {
  groupLabel: string;
  items: NavLinkItem[];
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: "OPERATIONS",
    items: [
      {
        label: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        label: "Enquiries",
        href: "/admin/enquiries",
        icon: Inbox,
      },
      {
        label: "Customers",
        href: "/admin/customers",
        icon: Building2,
      },
    ],
  },
  {
    groupLabel: "BILLING & FINANCE",
    items: [
      {
        label: "Monthly Billing",
        href: "/admin/billing",
        icon: Receipt,
      },
      {
        label: "Invoices",
        href: "/admin/billing/invoices",
        icon: FileText,
      },
      {
        label: "Ledger Scanner",
        href: "/admin/billing/upload",
        icon: ScanLine,
      },
    ],
  },
  {
    groupLabel: "SYSTEM",
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
      {
        label: "Public Website",
        href: "/",
        icon: ExternalLink,
        isExternal: true,
      },
    ],
  },
];
