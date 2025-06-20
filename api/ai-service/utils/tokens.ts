export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function estimateCost(inputTokens: number, outputTokens: number): number {
  const inputCostPerToken = 0.000001;
  const outputCostPerToken = 0.000002;
  const totalInputCost = inputTokens * inputCostPerToken;
  const totalOutputCost = outputTokens * outputCostPerToken;
  return totalInputCost + totalOutputCost;
}
