import { SummaryContent } from "./summary-content";
import { RequireAuth } from "../components/route-guards";
import { UserShell } from "../components/user-shell";

export const dynamic = "force-dynamic";

export default function SummaryPage() {
  return (
    <RequireAuth>
      <UserShell>
        <SummaryContent />
      </UserShell>
    </RequireAuth>
  );
}
