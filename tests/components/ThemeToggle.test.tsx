import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'next-themes'
import { ThemeToggle } from '@/components/theme-toggle'

describe('ThemeToggle', () => {
  // This helper function wraps the component in the provider
  const renderWithProvider = () => {
    return render(
      <ThemeProvider attribute="class" defaultTheme="system">
        <ThemeToggle />
      </ThemeProvider>
    )
  }

  it('renders the toggle button', () => {
    renderWithProvider()
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('toggles theme on click from light to dark', async () => {
    renderWithProvider()

    // Set the initial theme to light
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')

    const triggerButton = screen.getByRole('button')
    await userEvent.click(triggerButton) // First click: Open the menu

    // Find the 'Dark' option within the menu and click it
    const darkMenuItem = await screen.findByRole('menuitem', { name: /dark/i })
    await userEvent.click(darkMenuItem) // Second click: Change the theme

    // Wait for the DOM to be updated
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  it('toggles theme on click from dark to light', async () => {
    renderWithProvider()

    // Set the initial theme to dark
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')

    const triggerButton = screen.getByRole('button')
    await userEvent.click(triggerButton) // First click: Open the menu

    // Find the 'Light' option within the menu and click it
    const lightMenuItem = await screen.findByRole('menuitem', { name: /light/i })
    await userEvent.click(lightMenuItem) // Second click: Change the theme

    // Wait for the DOM to be updated
    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true)
    })
  })
})
