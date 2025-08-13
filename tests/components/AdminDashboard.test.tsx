import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

// Mock all imported components to test the connections
jest.mock('@/components/admin/layout/AdminHeader', () => ({
  AdminHeader: () => <div data-testid="admin-header">Admin Header</div>
}))

jest.mock('@/components/admin/layout/AdminSidebar', () => ({
  AdminSidebar: ({ activeSection, setActiveSection, navigationItems }: any) => (
    <div data-testid="admin-sidebar">
      {navigationItems.map((item: any) => (
        <button
          key={item.id}
          data-testid={`nav-${item.id}`}
          onClick={() => setActiveSection(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}))

jest.mock('@/components/admin/sections/OverviewSection', () => ({
  OverviewSection: () => <div data-testid="overview-section">Overview Section</div>
}))

jest.mock('@/components/admin/EmailCampaignManager', () => ({
  EmailCampaignManager: () => <div data-testid="email-campaign-manager">Email Campaign Manager</div>
}))

jest.mock('@/components/admin/LeadsList', () => ({
  LeadsList: ({ searchTerm, period }: any) => (
    <div data-testid="leads-list">
      Leads List - Search: {searchTerm}, Period: {period}
    </div>
  )
}))

jest.mock('@/components/admin/InteractionAnalytics', () => ({
  InteractionAnalytics: ({ period }: any) => (
    <div data-testid="interaction-analytics">Interaction Analytics - Period: {period}</div>
  )
}))

jest.mock('@/components/admin/AIPerformanceMetrics', () => ({
  AIPerformanceMetrics: ({ period }: any) => (
    <div data-testid="ai-performance-metrics">AI Performance - Period: {period}</div>
  )
}))

jest.mock('@/components/admin/RealTimeActivity', () => ({
  RealTimeActivity: () => <div data-testid="real-time-activity">Real Time Activity</div>
}))

jest.mock('@/components/admin/AdminChatInterface', () => ({
  AdminChatInterface: ({ className }: any) => (
    <div data-testid="admin-chat-interface" className={className}>Admin Chat Interface</div>
  )
}))

jest.mock('@/components/admin/TokenCostAnalytics', () => ({
  TokenCostAnalytics: () => <div data-testid="token-cost-analytics">Token Cost Analytics</div>
}))

jest.mock('@/components/admin/FlyIOCostControls', () => ({
  FlyIOCostControls: () => <div data-testid="flyio-cost-controls">FlyIO Cost Controls</div>
}))

jest.mock('@/components/admin/MeetingCalendar', () => ({
  MeetingCalendar: () => <div data-testid="meeting-calendar">Meeting Calendar</div>
}))

describe('AdminDashboard', () => {
  it('should render without errors', () => {
    const { container } = render(<AdminDashboard />)
    expect(container).toBeInTheDocument()
  })

  it('should render the header', () => {
    render(<AdminDashboard />)
    expect(screen.getByTestId('admin-header')).toBeInTheDocument()
  })

  it('should render the sidebar on desktop', () => {
    render(<AdminDashboard />)
    const sidebar = screen.queryByTestId('admin-sidebar')
    expect(sidebar).toBeInTheDocument()
  })

  it('should show overview section by default', () => {
    render(<AdminDashboard />)
    expect(screen.getByTestId('overview-section')).toBeInTheDocument()
  })

  it('should display section title and description', () => {
    render(<AdminDashboard />)
    // Use getByRole to target the heading specifically
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByText('System overview and key metrics')).toBeInTheDocument()
  })

  it('should render action buttons', () => {
    render(<AdminDashboard />)
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Filter')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
  })

  describe('Navigation', () => {
    it('should switch to leads section when clicked', async () => {
      render(<AdminDashboard />)
      const leadsButton = screen.getByTestId('nav-leads')
      fireEvent.click(leadsButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('leads-list')).toBeInTheDocument()
        expect(screen.getByText('Lead management and scoring')).toBeInTheDocument()
      })
    })

    it('should switch to meetings section when clicked', async () => {
      render(<AdminDashboard />)
      const meetingsButton = screen.getByTestId('nav-meetings')
      fireEvent.click(meetingsButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('meeting-calendar')).toBeInTheDocument()
        expect(screen.getByText('Meeting scheduling and tracking')).toBeInTheDocument()
      })
    })

    it('should switch to emails section when clicked', async () => {
      render(<AdminDashboard />)
      const emailsButton = screen.getByTestId('nav-emails')
      fireEvent.click(emailsButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('email-campaign-manager')).toBeInTheDocument()
        expect(screen.getByText('Email campaigns and automation')).toBeInTheDocument()
      })
    })

    it('should switch to costs section and show tabs', async () => {
      render(<AdminDashboard />)
      const costsButton = screen.getByTestId('nav-costs')
      fireEvent.click(costsButton)
      
      await waitFor(() => {
        expect(screen.getByText('AI Usage')).toBeInTheDocument()
        expect(screen.getByText('Infrastructure')).toBeInTheDocument()
        expect(screen.getByTestId('token-cost-analytics')).toBeInTheDocument()
      })
    })

    it('should switch to analytics section when clicked', async () => {
      render(<AdminDashboard />)
      const analyticsButton = screen.getByTestId('nav-analytics')
      fireEvent.click(analyticsButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('interaction-analytics')).toBeInTheDocument()
        expect(screen.getByText('Business performance insights')).toBeInTheDocument()
      })
    })

    it('should switch to AI performance section when clicked', async () => {
      render(<AdminDashboard />)
      const aiPerfButton = screen.getByTestId('nav-ai-performance')
      fireEvent.click(aiPerfButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('ai-performance-metrics')).toBeInTheDocument()
        expect(screen.getByText('AI model performance metrics')).toBeInTheDocument()
      })
    })

    it('should switch to activity section when clicked', async () => {
      render(<AdminDashboard />)
      const activityButton = screen.getByTestId('nav-activity')
      fireEvent.click(activityButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('real-time-activity')).toBeInTheDocument()
        expect(screen.getByText('Real-time system activity')).toBeInTheDocument()
      })
    })

    it('should switch to AI assistant section when clicked', async () => {
      render(<AdminDashboard />)
      const aiAssistantButton = screen.getByTestId('nav-ai-assistant')
      fireEvent.click(aiAssistantButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('admin-chat-interface')).toBeInTheDocument()
        expect(screen.getByText('AI-powered business intelligence')).toBeInTheDocument()
      })
    })
  })

  describe('Component Props', () => {
    it('should pass correct props to LeadsList', async () => {
      render(<AdminDashboard />)
      const leadsButton = screen.getByTestId('nav-leads')
      fireEvent.click(leadsButton)
      
      await waitFor(() => {
        const leadsComponent = screen.getByTestId('leads-list')
        expect(leadsComponent).toHaveTextContent('Search: , Period: last_30_days')
      })
    })

    it('should pass correct props to InteractionAnalytics', async () => {
      render(<AdminDashboard />)
      const analyticsButton = screen.getByTestId('nav-analytics')
      fireEvent.click(analyticsButton)
      
      await waitFor(() => {
        const analyticsComponent = screen.getByTestId('interaction-analytics')
        expect(analyticsComponent).toHaveTextContent('Period: last_30_days')
      })
    })

    it('should pass correct props to AIPerformanceMetrics', async () => {
      render(<AdminDashboard />)
      const aiPerfButton = screen.getByTestId('nav-ai-performance')
      fireEvent.click(aiPerfButton)
      
      await waitFor(() => {
        const aiPerfComponent = screen.getByTestId('ai-performance-metrics')
        expect(aiPerfComponent).toHaveTextContent('Period: last_30_days')
      })
    })
  })

  describe('Mobile Responsiveness', () => {
    it('should render mobile select dropdown', () => {
      render(<AdminDashboard />)
      const mobileSelect = document.querySelector('select')
      expect(mobileSelect).toBeInTheDocument()
      expect(mobileSelect).toHaveValue('overview')
    })

    it('should change section via mobile select', async () => {
      render(<AdminDashboard />)
      const mobileSelect = document.querySelector('select') as HTMLSelectElement
      
      fireEvent.change(mobileSelect, { target: { value: 'leads' } })
      
      await waitFor(() => {
        expect(screen.getByTestId('leads-list')).toBeInTheDocument()
      })
    })
  })
})
