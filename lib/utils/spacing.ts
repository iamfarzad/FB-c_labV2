/**
 * Spacing utilities for consistent layout patterns
 * Based on Tailwind's spacing scale and common UI patterns
 */

export const spacing = {
  // Component spacing
  xs: 'p-1',
  sm: 'p-2', 
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
  
  // Gap spacing
  gapXs: 'gap-1',
  gapSm: 'gap-2',
  gapMd: 'gap-3', 
  gapLg: 'gap-4',
  gapXl: 'gap-6',
  
  // Margin spacing
  marginXs: 'm-1',
  marginSm: 'm-2',
  marginMd: 'm-4',
  marginLg: 'm-6',
  marginXl: 'm-8',
  
  // Padding spacing
  paddingXs: 'px-1 py-1',
  paddingSm: 'px-2 py-2',
  paddingMd: 'px-4 py-4',
  paddingLg: 'px-6 py-6',
  paddingXl: 'px-8 py-8',
  
  // Responsive spacing (Tailwind breakpoints)
  responsive: {
    base: 'p-2 md:p-4',       // 0+
    md: 'p-3 md:p-4 lg:p-6',  // 768+
    lg: 'p-4 md:p-6 lg:p-8',  // 1024+
  },
  
  // Layout spacing
  layout: {
    sidebar: 'w-16',
    header: 'h-14 md:h-16',
    content: 'p-4',
    chat: 'h-[48svh] md:h-80',
    stageRail: 'top-20 md:top-24'
  }
} as const

/**
 * Get consistent spacing class based on component type
 */
export type SpacingType = 'component' | 'layout' | 'responsive'
export type ComponentSpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' |
  'gapXs' | 'gapSm' | 'gapMd' | 'gapLg' | 'gapXl' |
  'marginXs' | 'marginSm' | 'marginMd' | 'marginLg' | 'marginXl' |
  'paddingXs' | 'paddingSm' | 'paddingMd' | 'paddingLg' | 'paddingXl'
export type LayoutSpacingSize = keyof typeof spacing.layout
export type ResponsiveSpacingSize = keyof typeof spacing.responsive

export function getSpacing(type: 'component', size?: ComponentSpacingSize): string
export function getSpacing(type: 'layout', size?: LayoutSpacingSize): string
export function getSpacing(type: 'responsive', size?: ResponsiveSpacingSize): string
export function getSpacing(type: SpacingType = 'component', size?: string): string {
  if (type === 'layout') {
    return spacing.layout[size as keyof typeof spacing.layout] || spacing.layout.content
  }
  
  if (type === 'responsive') {
    return spacing.responsive[size as keyof typeof spacing.responsive] || spacing.responsive.base
  }
  
  return spacing[size as keyof typeof spacing] || spacing.md
}

export const getResponsiveSpacing = (size: ResponsiveSpacingSize = 'base') => getSpacing('responsive', size)
export const getLayoutSpacing = (size: LayoutSpacingSize = 'content') => getSpacing('layout', size)
export const getComponentSpacing = (size: ComponentSpacingSize = 'md') => getSpacing('component', size)

/**
 * Common spacing patterns for specific UI elements
 */
export const uiSpacing = {
  // Sidebar elements
  sidebar: {
    container: 'w-16',
    item: 'w-12 h-12',
    gap: 'space-y-2',
    padding: 'py-3 px-2'
  },
  
  // Header elements  
  header: {
    height: 'h-14 md:h-16',
    padding: 'px-4',
    gap: 'gap-3'
  },
  
  // Content areas
  content: {
    padding: 'p-4',
    gap: 'gap-4',
    margin: 'mb-4'
  },
  
  // Chat panel
  chat: {
    height: 'h-[48svh] md:h-80',
    padding: 'p-4',
    header: 'h-12 px-4'
  },
  
  // Stage rail
  stageRail: {
    position: 'top-20 md:top-24 right-4',
    gap: 'gap-3',
    item: 'w-8 h-8 md:w-10 md:h-10'
  }
} as const
