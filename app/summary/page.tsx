import { SummaryContent } from "./summary-content";
import { RequireAuth } from "../components/route-guards";

export const dynamic = "force-dynamic";

export default function SummaryPage() {
  return (
    <RequireAuth>
      <SummaryContent />
    </RequireAuth>
  );
}
