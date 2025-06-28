import { useState, useCallback } from 'react';

export function useAnalysisHistory(limit: number = 5) {
  const [analysisHistory, setAnalysisHistory] = useState<string[]>([]);

  const addAnalysis = useCallback((analysis: string) => {
    setAnalysisHistory(prev => [analysis, ...prev.slice(0, limit - 1)]);
  }, [limit]);

  const clearHistory = useCallback(() => {
    setAnalysisHistory([]);
  }, []);

  return { analysisHistory, addAnalysis, clearHistory };
} 