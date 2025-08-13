/**
 * Integration test for Admin Dashboard
 * Verifies all components are properly connected and working
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminPage from '@/app/admin/page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/admin',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock PageShell and PageHeader components
jest.mock('@/components/page-shell', () => ({
  PageShell: ({ children }: any) => <div data-testid="page-shell">{children}</div>,
  PageHeader: ({ title, subtitle }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}))

// Mock AdminDashboard to test integration
jest.mock('@/components/admin/AdminDashboard', () => ({
  AdminDashboard: () => <div data-testid="admin-dashboard">Admin Dashboard Component</div>
}))

// Mock fetch for authentication check
global.fetch = jest.fn()

describe('Admin Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state initially', () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    )
    
    render(<AdminPage />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should render admin dashboard when authenticated', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<AdminPage />)

    await waitFor(() => {
      expect(screen.getByTestId('page-shell')).toBeInTheDocument()
    })

    expect(screen.getByTestId('page-header')).toBeInTheDocument()
    expect(screen.getByText('F.B/c AI Admin Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Monitor leads, analyze interactions, and track AI performance')).toBeInTheDocument()
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument()
  })

  it('should redirect to login when not authenticated', async () => {
    const mockPush = jest.fn()
    const useRouter = jest.spyOn(require('next/navigation'), 'useRouter')
    useRouter.mockImplementation(() => ({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }))

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    })

    render(<AdminPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/login')
    })
  })

  it('should redirect to login on fetch error', async () => {
    const mockPush = jest.fn()
    const useRouter = jest.spyOn(require('next/navigation'), 'useRouter')
    useRouter.mockImplementation(() => ({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }))

    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<AdminPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/login')
    })
  })

  it('should make authentication check with correct endpoint', () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<AdminPage />)

    expect(global.fetch).toHaveBeenCalledWith('/api/admin/stats', {
      credentials: 'include',
    })
  })
})

describe('Admin Dashboard Component Connections', () => {
  // Restore actual AdminDashboard for this test suite
  beforeAll(() => {
    jest.unmock('@/components/admin/AdminDashboard')
  })

  afterAll(() => {
    // Re-mock after tests
    jest.mock('@/components/admin/AdminDashboard', () => ({
      AdminDashboard: () => <div data-testid="admin-dashboard">Admin Dashboard Component</div>
    }))
  })

  it('should verify all admin components are exportable', () => {
    // This test verifies that all components can be imported without errors
    expect(() => require('@/components/admin/AdminDashboard')).not.toThrow()
    expect(() => require('@/components/admin/layout/AdminHeader')).not.toThrow()
    expect(() => require('@/components/admin/layout/AdminSidebar')).not.toThrow()
    expect(() => require('@/components/admin/sections/OverviewSection')).not.toThrow()
    expect(() => require('@/components/admin/EmailCampaignManager')).not.toThrow()
    expect(() => require('@/components/admin/LeadsList')).not.toThrow()
    expect(() => require('@/components/admin/InteractionAnalytics')).not.toThrow()
    expect(() => require('@/components/admin/AIPerformanceMetrics')).not.toThrow()
    expect(() => require('@/components/admin/RealTimeActivity')).not.toThrow()
    expect(() => require('@/components/admin/AdminChatInterface')).not.toThrow()
    expect(() => require('@/components/admin/TokenCostAnalytics')).not.toThrow()
    expect(() => require('@/components/admin/FlyIOCostControls')).not.toThrow()
    expect(() => require('@/components/admin/MeetingCalendar')).not.toThrow()
  })
})