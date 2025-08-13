import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import WorkshopPage from '@/app/workshop/page'

describe('WorkshopPage', () => {
  it('renders Interactive AI Education header and modules', () => {
    render(<WorkshopPage /> as any)
    expect(screen.getByText('Interactive AI Education')).toBeInTheDocument()
    expect(screen.getByText(/Learn by doing/)).toBeInTheDocument()
    // Static server content
    expect(screen.getByText('What to Expect from AI Training')).toBeInTheDocument()
  })
})


