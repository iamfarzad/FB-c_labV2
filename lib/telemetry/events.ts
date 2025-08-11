export type TelemetryEvent = {
  type: string
  sessionId?: string
  metadata?: Record<string, any>
}

export async function fireAndForget(event: TelemetryEvent) {
  try {
    // Minimal no-op stub; wire to real sink later
    if (process.env.NODE_ENV !== 'test') {
      console.debug('telemetry:', JSON.stringify(event))
    }
  } catch {}
}


