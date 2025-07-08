import { UITestDashboard } from "@/components/ui-test-dashboard"
import { PageHeader, PageShell } from "@/components/page-shell"
import { TestStatusIndicator } from "@/components/test-status-indicator"

export default function TestDashboardPage() {
  return (
    <PageShell>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
        <PageHeader
          title="System Test Dashboard"
          subtitle="Comprehensive testing suite for F.B/c AI system functionality and user experience"
          className="flex-1"
        />
        <TestStatusIndicator />
      </div>
      <UITestDashboard />
    </PageShell>
  )
}
