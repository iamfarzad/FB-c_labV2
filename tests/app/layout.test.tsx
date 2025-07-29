import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import RootLayout from '@/app/layout'

describe('RootLayout Component', () => {
  it('renders children content', () => {
    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    )
    expect(screen.getByText('Test Child')).toBeInTheDocument()
  })

  it('renders html lang attribute', () => {
    render(
      <RootLayout>
        <div>Test Child</div>
      </RootLayout>
    )
    expect(document.documentElement.lang).toBe('en')
  })
})
