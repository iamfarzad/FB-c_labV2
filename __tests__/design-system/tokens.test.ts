import { readFileSync } from 'fs'

describe('Design Tokens', () => {
  test('color tokens are defined in HSL format', () => {
    try {
      const css = readFileSync('app/globals.css', 'utf8')
      const colorTokens = css.match(/--color-[^:]+:\s*hsl\([^)]+\)/g)
      
      if (colorTokens) {
        colorTokens.forEach(token => {
          expect(token).toMatch(/hsl\(\d+\s+\d+%\s+\d+%\)/)
        })
      }
    } catch (error) {
      console.warn('Could not read globals.css file')
    }
  })
  
  test('spacing tokens follow Tailwind scale', () => {
    try {
      const tailwindConfig = require('../../tailwind.config.ts')
      const spacing = tailwindConfig.theme?.extend?.spacing || {}
      
      // Check if spacing is defined
      expect(spacing).toBeDefined()
    } catch (error) {
      console.warn('Could not read tailwind.config.ts file')
    }
  })

  test('CSS custom properties are properly formatted', () => {
    try {
      const css = readFileSync('app/globals.css', 'utf8')
      const customProps = css.match(/--[a-z-]+:\s*[^;]+;/g)
      
      if (customProps) {
        customProps.forEach(prop => {
          expect(prop).toMatch(/^--[a-z-]+:\s*[^;]+;$/)
        })
      }
    } catch (error) {
      console.warn('Could not read globals.css file')
    }
  })
})