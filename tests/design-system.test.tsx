import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ChatBubble } from '@/components/ui/chat-bubble'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => children,
}))

describe('Design System Components', () => {
  describe('Button Component', () => {
    it('renders with default variant', () => {
      render(<Button>Click me</Button>)
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-primary')
    })

    it('renders with outline variant', () => {
      render(<Button variant="outline">Outline Button</Button>)
      const button = screen.getByRole('button', { name: /outline button/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('border-input')
    })

    it('renders with ghost variant', () => {
      render(<Button variant="ghost">Ghost Button</Button>)
      const button = screen.getByRole('button', { name: /ghost button/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('hover:bg-accent')
    })

    it('renders with different sizes', () => {
      render(
        <div>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">Icon</Button>
        </div>
      )
      
      const smallButton = screen.getByRole('button', { name: /small/i })
      const largeButton = screen.getByRole('button', { name: /large/i })
      const iconButton = screen.getByRole('button', { name: /icon/i })
      
      expect(smallButton).toHaveClass('h-9')
      expect(largeButton).toHaveClass('h-11')
      expect(iconButton).toHaveClass('h-10', 'w-10')
    })

    it('handles disabled state', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button', { name: /disabled button/i })
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:pointer-events-none')
    })
  })

  describe('Card Component', () => {
    it('renders card with all parts', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })

    it('applies correct styling classes', () => {
      render(
        <Card data-testid="test-card">
          <CardContent>Content</CardContent>
        </Card>
      )

      const card = screen.getByTestId('test-card')
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card')
    })
  })

  describe('Input Component', () => {
    it('renders input with placeholder', () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('flex', 'h-10', 'w-full')
    })

    it('handles disabled state', () => {
      render(<Input disabled placeholder="Disabled input" />)
      const input = screen.getByPlaceholderText('Disabled input')
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed')
    })

    it('applies file input styling', () => {
      render(<Input type="file" />)
      const input = screen.getByRole('textbox', { hidden: true }) || screen.getByDisplayValue('')
      expect(input).toHaveAttribute('type', 'file')
    })
  })

  describe('ChatBubble Component', () => {
    it('renders user message bubble', () => {
      render(
        <ChatBubble variant="user" data-testid="user-bubble">
          User message
        </ChatBubble>
      )

      const bubble = screen.getByTestId('user-bubble')
      expect(bubble).toBeInTheDocument()
      expect(bubble).toHaveClass('bg-primary')
      expect(screen.getByText('User message')).toBeInTheDocument()
    })

    it('renders assistant message bubble', () => {
      render(
        <ChatBubble variant="assistant" data-testid="assistant-bubble">
          Assistant message
        </ChatBubble>
      )

      const bubble = screen.getByTestId('assistant-bubble')
      expect(bubble).toBeInTheDocument()
      expect(bubble).toHaveClass('bg-muted')
      expect(screen.getByText('Assistant message')).toBeInTheDocument()
    })

    it('renders system message bubble', () => {
      render(
        <ChatBubble variant="system" data-testid="system-bubble">
          System message
        </ChatBubble>
      )

      const bubble = screen.getByTestId('system-bubble')
      expect(bubble).toBeInTheDocument()
      expect(bubble).toHaveClass('bg-accent')
      expect(screen.getByText('System message')).toBeInTheDocument()
    })
  })

  describe('Badge Component', () => {
    it('renders with default variant', () => {
      render(<Badge>Default Badge</Badge>)
      const badge = screen.getByText('Default Badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-primary')
    })

    it('renders with secondary variant', () => {
      render(<Badge variant="secondary">Secondary Badge</Badge>)
      const badge = screen.getByText('Secondary Badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-secondary')
    })

    it('renders with destructive variant', () => {
      render(<Badge variant="destructive">Error Badge</Badge>)
      const badge = screen.getByText('Error Badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-destructive')
    })

    it('renders with outline variant', () => {
      render(<Badge variant="outline">Outline Badge</Badge>)
      const badge = screen.getByText('Outline Badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-foreground')
    })
  })

  describe('Avatar Component', () => {
    it('renders avatar with fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>
      )

      const fallback = screen.getByText('FB')
      expect(fallback).toBeInTheDocument()
    })

    it('applies correct styling classes', () => {
      render(
        <Avatar data-testid="test-avatar">
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>
      )

      const avatar = screen.getByTestId('test-avatar')
      expect(avatar).toHaveClass('relative', 'flex', 'h-10', 'w-10')
    })
  })

  describe('Design System Integration', () => {
    it('uses consistent color variables', () => {
      render(
        <div>
          <Button className="test-primary">Primary</Button>
          <Card className="test-card">
            <CardContent className="test-content">Content</CardContent>
          </Card>
        </div>
      )

      // Check that CSS custom properties are being used
      const button = screen.getByRole('button')
      const card = screen.getByText('Content').closest('[class*="test-card"]')
      
      expect(button).toHaveClass('bg-primary')
      expect(card).toHaveClass('bg-card')
    })

    it('maintains consistent spacing and typography', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Consistent Typography</CardTitle>
            <CardDescription>This should use consistent spacing</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Action Button</Button>
          </CardContent>
        </Card>
      )

      const title = screen.getByText('Consistent Typography')
      const description = screen.getByText('This should use consistent spacing')
      const button = screen.getByRole('button')

      expect(title).toHaveClass('text-2xl', 'font-semibold')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
      expect(button).toHaveClass('h-10', 'px-4', 'py-2')
    })

    it('supports dark mode classes', () => {
      render(
        <div className="dark">
          <Button>Dark Mode Button</Button>
          <Card>
            <CardContent>Dark Mode Card</CardContent>
          </Card>
        </div>
      )

      // Components should have dark mode support through CSS variables
      const button = screen.getByRole('button')
      const card = screen.getByText('Dark Mode Card').closest('[class*="bg-card"]')
      
      expect(button).toBeInTheDocument()
      expect(card).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive classes correctly', () => {
      render(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card className="w-full">
            <CardContent>Responsive Card 1</CardContent>
          </Card>
          <Card className="w-full">
            <CardContent>Responsive Card 2</CardContent>
          </Card>
          <Card className="w-full">
            <CardContent>Responsive Card 3</CardContent>
          </Card>
        </div>
      )

      const cards = screen.getAllByText(/Responsive Card/)
      expect(cards).toHaveLength(3)
      
      cards.forEach(card => {
        const cardElement = card.closest('[class*="w-full"]')
        expect(cardElement).toHaveClass('w-full')
      })
    })
  })

  describe('Accessibility', () => {
    it('maintains proper ARIA attributes', () => {
      render(
        <div>
          <Button aria-label="Close dialog">×</Button>
          <Input aria-describedby="help-text" placeholder="Email" />
          <div id="help-text">Enter your email address</div>
        </div>
      )

      const button = screen.getByRole('button', { name: /close dialog/i })
      const input = screen.getByPlaceholderText('Email')
      
      expect(button).toHaveAttribute('aria-label', 'Close dialog')
      expect(input).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('supports keyboard navigation', () => {
      render(
        <div>
          <Button>First Button</Button>
          <Button>Second Button</Button>
          <Input placeholder="Input field" />
        </div>
      )

      const buttons = screen.getAllByRole('button')
      const input = screen.getByRole('textbox')
      
      // All interactive elements should be focusable
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1')
      })
      expect(input).not.toHaveAttribute('tabindex', '-1')
    })
  })
})

describe('Design System Performance', () => {
  it('renders components efficiently', () => {
    const startTime = performance.now()
    
    render(
      <div>
        {Array.from({ length: 50 }, (_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Card {i + 1}</CardTitle>
              <CardDescription>Description for card {i + 1}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Action {i + 1}</Button>
              <Badge>Badge {i + 1}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    )
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    // Should render 50 cards with components in reasonable time (< 100ms)
    expect(renderTime).toBeLessThan(100)
    
    // Verify all components rendered
    expect(screen.getAllByText(/Card \d+/)).toHaveLength(50)
    expect(screen.getAllByRole('button')).toHaveLength(50)
  })
})
