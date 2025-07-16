import { render } from '@testing-library/react'

describe('ARIA Compliance', () => {
  test('Button has proper ARIA attributes', () => {
    const { getByRole } = render(
      <button aria-label="Test button">Click me</button>
    )
    
    const button = getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Test button')
  })
  
  test('Dialog has proper ARIA attributes', () => {
    const { getByRole } = render(
      <div role="dialog" aria-labelledby="dialog-title">
        <h2 id="dialog-title">Dialog Title</h2>
        <p>Dialog content</p>
      </div>
    )
    
    const dialog = getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title')
  })

  test('Form has proper ARIA attributes', () => {
    const { getByRole } = render(
      <form aria-label="Test form">
        <input type="text" aria-describedby="input-help" />
        <div id="input-help">Help text</div>
      </form>
    )
    
    const form = getByRole('form')
    expect(form).toHaveAttribute('aria-label', 'Test form')
  })

  test('Navigation has proper ARIA attributes', () => {
    const { getByRole } = render(
      <nav aria-label="Main navigation">
        <ul>
          <li><a href="/">Home</a></li>
        </ul>
      </nav>
    )
    
    const navigation = getByRole('navigation')
    expect(navigation).toHaveAttribute('aria-label', 'Main navigation')
  })
})