import { UITestDashboard } from "@/components/ui-test-dashboard"
import { PageHeader, PageShell } from "@/components/page-shell"

export default function TestDashboardPage() {
  return (
    <PageShell>
      <PageHeader
        title="UI Test Dashboard"
        subtitle="Comprehensive testing suite for F.B/c AI system functionality and user experience"
      />
      <UITestDashboard />
    </PageShell>
  )
}
