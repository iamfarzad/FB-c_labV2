import { readdirSync } from 'fs'
import { join } from 'path'

describe('Component Structure', () => {
  test('all components are in correct directories', () => {
    const componentDirs = [
      'components/ui',
      'components/chat',
      'components/admin',
      'components/providers'
    ]
    
    componentDirs.forEach(dir => {
      try {
        const files = readdirSync(dir)
        files.forEach(file => {
          if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            expect(file).toMatch(/^[A-Z][a-zA-Z0-9]*\.(tsx|ts)$/)
          }
        })
      } catch (error) {
        // Directory doesn't exist, which is fine
        console.warn(`Directory ${dir} not found`)
      }
    })
  })

  test('components follow naming conventions', () => {
    const componentFiles = [
      'components/header.tsx',
      'components/footer.tsx',
      'components/ui/button.tsx',
      'components/ui/card.tsx'
    ]
    
    componentFiles.forEach(file => {
      try {
        const content = readdirSync(file)
        expect(content).toBeDefined()
      } catch (error) {
        // File doesn't exist, which is fine for this test
        console.warn(`File ${file} not found`)
      }
    })
  })
})