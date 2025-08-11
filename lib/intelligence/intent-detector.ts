import type { IntentResult } from '@/types/intelligence'

const INTENT_KEYWORDS: Record<IntentResult['type'], string[]> = {
  consulting: ['consult', 'audit', 'integration', 'prototype', 'roi', 'estimate', 'plan'],
  workshop: ['workshop', 'training', 'enablement', 'bootcamp', 'session', 'book'],
  other: []
}

export function detectIntent(userMessage: string): IntentResult {
  const text = (userMessage || '').toLowerCase()
  const scores: Record<IntentResult['type'], number> = { consulting: 0, workshop: 0, other: 0 }
  for (const [type, words] of Object.entries(INTENT_KEYWORDS) as Array<[IntentResult['type'], string[]]>) {
    for (const w of words) if (text.includes(w)) scores[type] += 1
  }
  // simple heuristic
  let type: IntentResult['type'] = 'other'
  if (scores.consulting > scores.workshop && scores.consulting > 0) type = 'consulting'
  else if (scores.workshop > 0) type = 'workshop'
  const confidence = type === 'other' ? 0.4 : Math.min(0.9, (scores[type] || 1) / 3)
  const slots: Record<string, any> = {}
  return { type, confidence, slots }
}


