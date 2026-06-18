"use client";

import type { ReactNode } from "react";
import { RequireAuth } from "../components/route-guards";
import { UserShell } from "../components/user-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <UserShell>{children}</UserShell>
    </RequireAuth>
  );
}

