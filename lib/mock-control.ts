export function isMockEnabled(): boolean {
  const v = (process.env.FBC_USE_MOCKS || process.env.NEXT_PUBLIC_USE_MOCKS || '').toString().trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}


