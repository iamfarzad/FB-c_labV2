import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import About from '@/app/about/page'

describe('About Page', () => {
  it('renders About page content', () => {
    render(<About />)
    expect(screen.getByText(/About/i)).toBeInTheDocument()
  })
})
