export async function generateResponse(prompt: string): Promise<string> {
  return `mock:${prompt}`
}

export async function generateStreamingResponse(prompt: string): Promise<AsyncGenerator<string>> {
  async function* gen() { yield `mock:${prompt}` }
  return gen()
}


