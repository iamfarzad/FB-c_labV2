import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Header from '@/components/header'

describe('Header Component', () => {
  it('renders navigation links', () => {
    render(<Header />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Consulting')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Workshop')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders brand logo', () => {
    render(<Header />)
    expect(screen.getByText('F.B')).toBeInTheDocument()
  })
})
