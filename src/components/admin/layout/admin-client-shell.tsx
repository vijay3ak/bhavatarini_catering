"use client";

import React, { useState } from "react";
import { AdminSidebar, type AdminProfileSummary } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { AdminMobileDrawer } from "./admin-mobile-drawer";

interface AdminClientShellProps {
  children: React.ReactNode;
  verifiedProfile?: AdminProfileSummary | null;
}

export function AdminClientShell({
  children,
  verifiedProfile,
}: AdminClientShellProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f1] text-[#17271e] print:min-h-0 print:h-auto print:bg-white print:text-black">
      {/* Brand Top Bar */}
      <div
        aria-hidden="true"
        className="h-1 w-full bg-gradient-to-r from-[#123c2c] via-[#c7a45b] to-[#1c573e] shrink-0 print:hidden"
      />

      <div className="flex-1 flex overflow-hidden print:overflow-visible print:block print:h-auto">
        {/* Desktop Sidebar (Fixed Width, Visible >= lg) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[#c7a45b]/20 print:hidden">
          <AdminSidebar initialProfile={verifiedProfile} />
        </aside>

        {/* Mobile Navigation Drawer (< lg) */}
        <AdminMobileDrawer
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          initialProfile={verifiedProfile}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto print:overflow-visible print:block print:h-auto print:min-h-0 print:p-0">
          <AdminHeader onToggleMobileMenu={() => setMobileDrawerOpen(true)} />
          <main className="flex-1 p-4 md:p-8 print:p-0 print:m-0 print:block print:h-auto print:max-w-none">
            <div className="max-w-7xl mx-auto print:max-w-none print:w-full print:m-0 print:p-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
