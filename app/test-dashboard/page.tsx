import { PageShell } from "@/components/page-shell"
import { UITestDashboard } from "@/components/ui-test-dashboard"

export default function TestDashboardPage() {
  return (
    <PageShell>
      <div className="container mx-auto py-10">
        <UITestDashboard />
      </div>
    </PageShell>
  )
}
