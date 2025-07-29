import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Consulting from '@/app/consulting/page'

describe('Consulting Page', () => {
  it('renders Consulting page content', () => {
    render(<Consulting />)
    expect(screen.getByText(/Consulting/i)).toBeInTheDocument()
  })
})
