"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface AdminUser {
  email: string
  role: 'admin'
  exp: number
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      const decoded = JSON.parse(atob(token))
      const now = Date.now()

      if (decoded.exp < now) {
        // Token expired
        localStorage.removeItem('adminToken')
        setUser(null)
        setIsLoading(false)
        return
      }

      setUser(decoded)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('adminToken')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = (email: string, password: string): boolean => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "farzad@farzadbayat.com"
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"

    if (email === adminEmail && password === adminPassword) {
      const token = btoa(JSON.stringify({
        email: adminEmail,
        role: 'admin' as const,
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      }))
      
      localStorage.setItem('adminToken', token)
      setUser({ email: adminEmail, role: 'admin', exp: Date.now() + 24 * 60 * 60 * 1000 })
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setUser(null)
    router.push('/admin/login')
  }

  const requireAuth = () => {
    if (!isLoading && !user) {
      router.push('/admin/login')
      return false
    }
    return true
  }

  return {
    user,
    isLoading,
    login,
    logout,
    requireAuth,
    checkAuth
  }
} 