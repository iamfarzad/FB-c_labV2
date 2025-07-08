"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from "recharts"
import { Download, DollarSign, TrendingUp, Activity, Zap } from "lucide-react"

interface TokenUsageData {
  id: string
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  inputCost: number
  outputCost: number
  totalCost: number
  timestamp: string
  sessionId: string
  requestType: string
}

interface CostSummary {
  totalCost: number
  totalTokens: number
  totalRequests: number
  averageCostPerRequest: number
  topProvider: string
  topModel: string
}

interface ProviderBreakdown {
  provider: string
  cost: number
  tokens: number
  requests: number
  percentage: number
}

export default function TokenCostAnalytics() {
  const [timeframe, setTimeframe] = useState("24h")
  const [usageData, setUsageData] = useState<TokenUsageData[]>([])
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null)
  const [providerBreakdown, setProviderBreakdown] = useState<ProviderBreakdown[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data for demonstration
  useEffect(() => {
    const mockData: TokenUsageData[] = [
      {
        id: "1",
        provider: "gemini",
        model: "gemini-2.5-flash",
        inputTokens: 1500,
        outputTokens: 800,
        totalTokens: 2300,
        inputCost: 0.0001125,
        outputCost: 0.00024,
        totalCost: 0.0003525,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        sessionId: "session_1",
        requestType: "chat",
      },
      {
        id: "2",
        provider: "gemini",
        model: "gemini-2.5",
        inputTokens: 2000,
        outputTokens: 1200,
        totalTokens: 3200,
        inputCost: 0.0025,
        outputCost: 0.006,
        totalCost: 0.0085,
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        sessionId: "session_2",
        requestType: "chat",
      },
      {
        id: "3",
        provider: "openai",
        model: "gpt-4o-mini",
        inputTokens: 1800,
        outputTokens: 900,
        totalTokens: 2700,
        inputCost: 0.00027,
        outputCost: 0.00054,
        totalCost: 0.00081,
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        sessionId: "session_3",
        requestType: "chat",
      },
    ]

    setUsageData(mockData)

    // Calculate summary
    const totalCost = mockData.reduce((sum, item) => sum + item.totalCost, 0)
    const totalTokens = mockData.reduce((sum, item) => sum + item.totalTokens, 0)
    const totalRequests = mockData.length

    setCostSummary({
      totalCost,
      totalTokens,
      totalRequests,
      averageCostPerRequest: totalCost / totalRequests,
      topProvider: "gemini",
      topModel: "gemini-2.5-flash",
    })

    // Calculate provider breakdown
    const providerMap = new Map<string, { cost: number; tokens: number; requests: number }>()

    mockData.forEach((item) => {
      const existing = providerMap.get(item.provider) || { cost: 0, tokens: 0, requests: 0 }
      providerMap.set(item.provider, {
        cost: existing.cost + item.totalCost,
        tokens: existing.tokens + item.totalTokens,
        requests: existing.requests + 1,
      })
    })

    const breakdown: ProviderBreakdown[] = Array.from(providerMap.entries()).map(([provider, data]) => ({
      provider,
      cost: data.cost,
      tokens: data.tokens,
      requests: data.requests,
      percentage: (data.cost / totalCost) * 100,
    }))

    setProviderBreakdown(breakdown)
    setIsLoading(false)
  }, [timeframe])

  const handleExportCSV = () => {
    const csvContent = [
      [
        "Timestamp",
        "Provider",
        "Model",
        "Input Tokens",
        "Output Tokens",
        "Total Tokens",
        "Input Cost",
        "Output Cost",
        "Total Cost",
        "Session ID",
      ],
      ...usageData.map((item) => [
        item.timestamp,
        item.provider,
        item.model,
        item.inputTokens.toString(),
        item.outputTokens.toString(),
        item.totalTokens.toString(),
        item.inputCost.toString(),
        item.outputCost.toString(),
        item.totalCost.toString(),
        item.sessionId,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `token-usage-${timeframe}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const chartColors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#8dd1e1"]

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error loading token analytics: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Token Cost Analytics</h2>
          <p className="text-muted-foreground">Monitor AI usage costs and token consumption</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {costSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${costSummary.totalCost.toFixed(6)}</div>
              <p className="text-xs text-muted-foreground">{timeframe} period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{costSummary.totalTokens.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{costSummary.totalRequests}</div>
              <p className="text-xs text-muted-foreground">API calls made</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Cost/Request</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${costSummary.averageCostPerRequest.toFixed(6)}</div>
              <p className="text-xs text-muted-foreground">Per API call</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts and Tables */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="usage">Usage Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Provider Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Cost by Provider</CardTitle>
                <CardDescription>Distribution of costs across AI providers</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    cost: {
                      label: "Cost",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={providerBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ provider, percentage }) => `${provider} (${percentage.toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="cost"
                      >
                        {providerBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Token Usage Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Token Usage Timeline</CardTitle>
                <CardDescription>Token consumption over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    tokens: {
                      label: "Tokens",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="totalTokens" stroke="var(--color-tokens)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Breakdown</CardTitle>
              <CardDescription>Detailed analysis by AI provider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerBreakdown.map((provider, index) => (
                  <div key={provider.provider} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: chartColors[index % chartColors.length] }}
                        />
                        <span className="font-medium capitalize">{provider.provider}</span>
                        <Badge variant="secondary">{provider.requests} requests</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${provider.cost.toFixed(6)}</div>
                        <div className="text-sm text-muted-foreground">{provider.tokens.toLocaleString()} tokens</div>
                      </div>
                    </div>
                    <Progress value={provider.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Usage Logs</CardTitle>
              <CardDescription>Detailed breakdown of recent API calls</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Session</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.provider}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.model}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{item.totalTokens.toLocaleString()}</div>
                          <div className="text-muted-foreground">
                            {item.inputTokens}→{item.outputTokens}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">${item.totalCost.toFixed(6)}</div>
                          <div className="text-muted-foreground">
                            ${item.inputCost.toFixed(6)} + ${item.outputCost.toFixed(6)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.sessionId.substring(0, 8)}...</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
