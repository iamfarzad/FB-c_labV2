import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/footer'

describe('Footer Component', () => {
  it('renders copyright text', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(`© ${currentYear} F.B Consulting`)).toBeInTheDocument()
  })

  it('renders About and Contact links', () => {
    render(<Footer />)
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders LinkedIn and email links', () => {
    render(<Footer />)
    expect(screen.getByText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByText('hello@farzadbayat.com')).toBeInTheDocument()
  })
})
