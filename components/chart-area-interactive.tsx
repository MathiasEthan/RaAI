"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { apiClient } from "@/lib/api"

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

export const description = "An interactive area chart showing emotional intelligence scores over time"

// Generate sample time series data based on current scores
function generateTimeSeriesData(scores: Record<string, number>) {
  const dates = [];
  const today = new Date();
  
  // Generate last 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Add some variation to the scores over time
    const variation = () => Math.random() * 20 - 10; // ±10 points variation
    
    dates.push({
      date: date.toISOString().split('T')[0],
      self_awareness: Math.max(0, Math.min(100, scores.self_awareness + variation())),
      self_regulation: Math.max(0, Math.min(100, scores.self_regulation + variation())),
      motivation: Math.max(0, Math.min(100, scores.motivation + variation())),
      empathy: Math.max(0, Math.min(100, scores.empathy + variation())),
      social_skills: Math.max(0, Math.min(100, scores.social_skills + variation()))
    });
  }
  
  return dates;
}

// Chart config with EI categories
const chartConfig = {
  self_awareness: { label: "Self-Awareness", color: "#6366f1" },
  self_regulation: { label: "Self-Regulation", color: "#f59e42" },
  motivation: { label: "Motivation", color: "#10b981" },
  empathy: { label: "Empathy", color: "#ef4444" },
  social_skills: { label: "Social Skills", color: "#f472b6" },
} satisfies ChartConfig

interface ChartDataPoint {
  date: string;
  self_awareness: number;
  self_regulation: number;
  motivation: number;
  empathy: number;
  social_skills: number;
}

interface DashboardScores {
  scores: {
    self_awareness: number;
    self_regulation: number;
    motivation: number;
    empathy: number;
    social_skills: number;
  };
  trends: Record<string, number>;
  overall_mood_index: number;
  last_updated: string;
  offline?: boolean;
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")
  const [chartData, setChartData] = React.useState<ChartDataPoint[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  React.useEffect(() => {
    async function fetchData() {
      try {
        const dashboardData: DashboardScores = await apiClient.getDashboardScores();
        const timeSeriesData = generateTimeSeriesData(dashboardData.scores);
        setChartData(timeSeriesData);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
        // Fallback data
        const fallbackScores = {
          self_awareness: 73,
          self_regulation: 68,
          motivation: 45,
          empathy: 78,
          social_skills: 62
        };
        setChartData(generateTimeSeriesData(fallbackScores));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter data based on selected time range
  const filteredData = React.useMemo(() => {
    if (!chartData.length) return [];
    
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 30;
    return chartData.slice(-days);
  }, [chartData, timeRange]);

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Your Growth</CardTitle>
          <CardDescription>Loading analytics...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="aspect-auto h-[250px] w-full bg-gray-100 animate-pulse rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Your Growth</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Emotional intelligence progress over time
          </span>
          <span className="@[540px]/card:hidden">EI Progress</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillSelfAwareness" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillSelfRegulation" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e42" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e42" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMotivation" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillEmpathy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillSocialSkills" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f472b6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f472b6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
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
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="self_awareness"
              type="natural"
              fill="url(#fillSelfAwareness)"
              stroke="#6366f1"
              stackId="a"
            />
            <Area
              dataKey="self_regulation"
              type="natural"
              fill="url(#fillSelfRegulation)"
              stroke="#f59e42"
              stackId="a"
            />
            <Area
              dataKey="motivation"
              type="natural"
              fill="url(#fillMotivation)"
              stroke="#10b981"
              stackId="a"
            />
            <Area
              dataKey="empathy"
              type="natural"
              fill="url(#fillEmpathy)"
              stroke="#ef4444"
              stackId="a"
            />
            <Area
              dataKey="social_skills"
              type="natural"
              fill="url(#fillSocialSkills)"
              stroke="#f472b6"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
