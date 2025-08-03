'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  TrendingDown, 
  Database, 
  Clock, 
  DollarSign, 
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface CacheStats {
  conversationEntries: number
  systemPromptEntries: number
  totalMemoryKB: number
}

interface OptimizationMetrics {
  totalApiCalls: number
  cachedResponses: number
  tokensSaved: number
  costSavings: number
  averageResponseTime: number
  errorRate: number
}

export function GeminiOptimizationDashboard() {
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    conversationEntries: 0,
    systemPromptEntries: 0,
    totalMemoryKB: 0
  })
  
  const [metrics, setMetrics] = useState<OptimizationMetrics>({
    totalApiCalls: 0,
    cachedResponses: 0,
    tokensSaved: 0,
    costSavings: 0,
    averageResponseTime: 0,
    errorRate: 0
  })

  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      // Fetch cache stats
      const cacheResponse = await fetch('/api/admin/cache-stats')
      if (cacheResponse.ok) {
        const cacheData = await cacheResponse.json()
        setCacheStats(cacheData)
      }

      // Fetch optimization metrics
      const metricsResponse = await fetch('/api/admin/optimization-metrics')
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
      }

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch optimization stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const performCacheCleanup = async () => {
    try {
      const response = await fetch('/api/admin/cache-cleanup', { method: 'POST' })
      if (response.ok) {
        await fetchStats() // Refresh stats after cleanup
      }
    } catch (error) {
      console.error('Failed to perform cache cleanup:', error)
    }
  }

  useEffect(() => {
    fetchStats()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const cacheHitRate = metrics.totalApiCalls > 0 
    ? (metrics.cachedResponses / metrics.totalApiCalls) * 100 
    : 0

  const optimizationStatus = cacheHitRate > 30 ? 'excellent' : cacheHitRate > 15 ? 'good' : 'needs-improvement'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gemini API Optimization Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor cache performance, cost savings, and API efficiency
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={optimizationStatus === 'excellent' ? 'default' : optimizationStatus === 'good' ? 'secondary' : 'destructive'}>
            {optimizationStatus === 'excellent' && <CheckCircle className="w-3 h-3 mr-1" />}
            {optimizationStatus === 'needs-improvement' && <AlertTriangle className="w-3 h-3 mr-1" />}
            {optimizationStatus.replace('-', ' ').toUpperCase()}
          </Badge>
          <Button onClick={fetchStats} disabled={isLoading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheHitRate.toFixed(1)}%</div>
            <Progress value={cacheHitRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.cachedResponses} of {metrics.totalApiCalls} requests cached
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Saved</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tokensSaved.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Through optimization techniques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.costSavings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Estimated monthly savings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              {metrics.errorRate.toFixed(1)}% error rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cache" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cache Statistics</CardTitle>
                <CardDescription>Current cache usage and memory consumption</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Conversation Cache Entries:</span>
                  <Badge variant="outline">{cacheStats.conversationEntries}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">System Prompt Cache Entries:</span>
                  <Badge variant="outline">{cacheStats.systemPromptEntries}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Memory Usage:</span>
                  <Badge variant="outline">{cacheStats.totalMemoryKB} KB</Badge>
                </div>
                <Button onClick={performCacheCleanup} className="w-full" variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  Perform Cache Cleanup
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Optimization Features</CardTitle>
                <CardDescription>Active cost-saving features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Context Caching</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Token Limits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Conversation Summarization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Auto-Analysis Throttling</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">System Prompt Optimization</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Optimization Impact</CardTitle>
              <CardDescription>Breakdown of optimization benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Cache Efficiency</span>
                    <span className="text-sm text-muted-foreground">{cacheHitRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={cacheHitRate} />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Token Reduction</span>
                    <span className="text-sm text-muted-foreground">
                      {metrics.tokensSaved > 0 ? `${((metrics.tokensSaved / (metrics.tokensSaved + metrics.totalApiCalls * 1000)) * 100).toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                  <Progress value={metrics.tokensSaved > 0 ? (metrics.tokensSaved / (metrics.tokensSaved + metrics.totalApiCalls * 1000)) * 100 : 0} />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Cost Optimization</span>
                    <span className="text-sm text-muted-foreground">
                      ${(metrics.costSavings / Math.max(metrics.costSavings + 50, 1) * 100).toFixed(1)}% saved
                    </span>
                  </div>
                  <Progress value={(metrics.costSavings / Math.max(metrics.costSavings + 50, 1)) * 100} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Analytics</CardTitle>
              <CardDescription>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics.totalApiCalls}</div>
                  <div className="text-sm text-muted-foreground">Total API Calls</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.cachedResponses}</div>
                  <div className="text-sm text-muted-foreground">Cached Responses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{metrics.averageResponseTime}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}