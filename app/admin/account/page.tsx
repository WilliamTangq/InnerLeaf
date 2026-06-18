import { RequireAdmin } from "../../components/route-guards";
import { AccountContent } from "../../account/page";

export default function AdminAccountPage() {
  return (
    <RequireAdmin>
      <AccountContent shell="admin" />
    </RequireAdmin>
  );
}
