"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminDashboard } from "@/components/admin/AdminDashboard"
import { PageHeader, PageShell } from "@/components/page-shell"

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated by making a request to a protected API
    fetch('/api/admin/stats', {
      credentials: 'include' // Include cookies
    })
    .then(response => {
      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        router.push('/admin/login')
      }
    })
    .catch(() => {
      router.push('/admin/login')
    })
    .finally(() => {
      setIsLoading(false)
    })
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

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
