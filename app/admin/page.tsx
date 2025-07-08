import { AdminDashboard } from "@/components/admin/AdminDashboard"
import { PageHeader, PageShell } from "@/components/page-shell"

export default function AdminPage() {
  return (
    <PageShell>
      <PageHeader
        title="F.B/c AI Admin Dashboard"
        subtitle="Monitor leads, analyze interactions, and track AI performance"
      />
      <AdminDashboard />
    </PageShell>
  )
}
