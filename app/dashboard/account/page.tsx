import { RequireAuth } from "../../components/route-guards";
import { AccountContent } from "../../account/page";

export default function DashboardAccountPage() {
  return (
    <RequireAuth>
      <AccountContent />
    </RequireAuth>
  );
}
