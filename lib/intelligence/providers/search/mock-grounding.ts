import type { GroundedAnswer } from '../search/google-grounding'

export async function groundedAnswer(query: string): Promise<GroundedAnswer> {
  return {
    text: `Mock grounded answer for: ${query}`,
    citations: [
      { uri: 'https://example.com/mock', title: 'Mock Source' }
    ],
    raw: null,
  }
}


