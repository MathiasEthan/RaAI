"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Badge } from "@/components/ui/badge"
import { apiClient, authUtils, errorUtils, type MoodSeriesData } from "@/lib/api"
import { IconTrendingUp, IconTrendingDown, IconMinus } from "@tabler/icons-react"

const chartConfig = {
  mood_index: { 
    label: "Mood Score", 
    color: "#3b82f6" 
  },
  ema7: { 
    label: "7-day Average", 
    color: "#10b981" 
  },
  ema14: { 
    label: "14-day Average", 
    color: "#f59e0b" 
  },
} satisfies ChartConfig

export function MoodAnalyticsChart() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState(isMobile ? "7" : "30")
  const [moodData, setMoodData] = React.useState<MoodSeriesData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState<{ _id: string } | null>(null)

  const generateMockData = React.useCallback(() => {
    const days = parseInt(timeRange)
    const mockData: MoodSeriesData[] = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Generate realistic mood data with some variance
      const baseScore = 6 + Math.sin(i * 0.3) * 2 + (Math.random() - 0.5) * 1.5
      const moodIndex = Math.max(1, Math.min(10, baseScore))
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        mood_index: Number(moodIndex.toFixed(1)),
        ema7: Number((moodIndex * 0.8 + 6 * 0.2).toFixed(1)),
        ema14: Number((moodIndex * 0.6 + 6 * 0.4).toFixed(1)),
        flag: moodIndex < 4 ? 'ATTENTION' : moodIndex > 8 ? 'SAFE' : 'SAFE'
      })
    }
    
    setMoodData(mockData)
    setLoading(false)
  }, [timeRange])

  const loadUserAndData = React.useCallback(async () => {
    try {
      const currentUser = await authUtils.checkAuth()
      if (currentUser) {
        setUser(currentUser)
      } else {
        // Generate mock data for demo
        generateMockData()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      generateMockData()
    }
  }, [generateMockData])

  const loadMoodData = React.useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const result = await apiClient.getMoodSeries(user._id, parseInt(timeRange))
      setMoodData(result.series)
    } catch (error) {
      errorUtils.handleApiError(error, "Loading mood data")
      generateMockData()
    } finally {
      setLoading(false)
    }
  }, [user, timeRange, generateMockData])

  React.useEffect(() => {
    loadUserAndData()
  }, [loadUserAndData])

  React.useEffect(() => {
    if (user) {
      loadMoodData()
    }
  }, [loadMoodData, user])

  const getMoodTrend = () => {
    if (moodData.length < 2) return null
    
    const recent = moodData.slice(-3)
    const earlier = moodData.slice(-6, -3)
    
    if (recent.length === 0 || earlier.length === 0) return null
    
    const recentAvg = recent.reduce((sum, d) => sum + d.mood_index, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, d) => sum + d.mood_index, 0) / earlier.length
    
    const diff = recentAvg - earlierAvg
    
    if (diff > 0.5) return { direction: 'up', change: diff }
    if (diff < -0.5) return { direction: 'down', change: Math.abs(diff) }
    return { direction: 'stable', change: 0 }
  }

  const currentMood = moodData.length > 0 ? moodData[moodData.length - 1]?.mood_index : null
  const trend = getMoodTrend()

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Mood Analytics
              {currentMood && (
                <Badge variant="secondary" className="ml-2">
                  Current: {currentMood}/10
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              <span className="hidden @[540px]/card:block">
                Track your emotional well-being over time
              </span>
              <span className="@[540px]/card:hidden">Your mood trends</span>
            </CardDescription>
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              {trend.direction === 'up' && (
                <div className="flex items-center text-green-600">
                  <IconTrendingUp className="h-4 w-4" />
                  <span className="ml-1">+{trend.change.toFixed(1)}</span>
                </div>
              )}
              {trend.direction === 'down' && (
                <div className="flex items-center text-red-600">
                  <IconTrendingDown className="h-4 w-4" />
                  <span className="ml-1">-{trend.change.toFixed(1)}</span>
                </div>
              )}
              {trend.direction === 'stable' && (
                <div className="flex items-center text-gray-600">
                  <IconMinus className="h-4 w-4" />
                  <span className="ml-1">Stable</span>
                </div>
              )}
            </div>
          )}
        </div>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="30">30 days</ToggleGroupItem>
            <ToggleGroupItem value="14">14 days</ToggleGroupItem>
            <ToggleGroupItem value="7">7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-32 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select time range"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="30" className="rounded-lg">30 days</SelectItem>
              <SelectItem value="14" className="rounded-lg">14 days</SelectItem>
              <SelectItem value="7" className="rounded-lg">7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-sm text-muted-foreground">Loading mood data...</div>
          </div>
        ) : moodData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">No mood data available</p>
              <p className="text-xs text-muted-foreground mt-1">Start journaling to see your mood trends</p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={moodData}>
              <defs>
                <linearGradient id="fillMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <YAxis
                domain={[1, 10]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    }}
                    indicator="line"
                    nameKey="name"
                    hideLabel={false}
                  />
                }
              />
              <Area
                dataKey="mood_index"
                type="monotone"
                fill="url(#fillMood)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
              {parseInt(timeRange) >= 14 && (
                <Area
                  dataKey="ema7"
                  type="monotone"
                  stroke="#10b981"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  fill="none"
                  dot={false}
                />
              )}
              {parseInt(timeRange) >= 30 && (
                <Area
                  dataKey="ema14"
                  type="monotone"
                  stroke="#f59e0b"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  fill="none"
                  dot={false}
                />
              )}
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}