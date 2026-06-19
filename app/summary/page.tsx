import { RoleAwareRedirect } from "../components/role-aware-redirect";

export const dynamic = "force-dynamic";

export default function SummaryPage() {
  return <RoleAwareRedirect target="/summary" />;
}
