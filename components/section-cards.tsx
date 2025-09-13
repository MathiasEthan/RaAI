"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardScores {
  scores: {
    self_awareness: number;
    self_regulation: number;
    motivation: number;
    empathy: number;
    social_skills: number;
  };
  trends: {
    self_awareness: number;
    self_regulation: number;
    motivation: number;
    empathy: number;
    social_skills: number;
  };
  overall_mood_index: number;
  last_updated: string;
  offline?: boolean;
}

export function SectionCards() {
  const [dashboardData, setDashboardData] = useState<DashboardScores | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const data = await apiClient.getDashboardScores();
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Fallback data will be used from the API client
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formatTrend = (trend: number) => {
    const isPositive = trend >= 0;
    return {
      value: `${isPositive ? '+' : ''}${trend.toFixed(1)}%`,
      icon: isPositive ? IconTrendingUp : IconTrendingDown,
      variant: isPositive ? 'default' : 'secondary' as const
    };
  };

  const getMotivationText = (score: number) => {
    if (score >= 70) return "Strong drive and initiative";
    if (score >= 50) return "Good motivation levels";
    if (score >= 30) return "Building momentum";
    return "Needs improvement in goal pursuit";
  };

  const getEncouragementText = (score: number, category: string) => {
    if (score >= 70) return "Keep it up";
    if (score >= 50) return "Doing well";
    if (score >= 30) return "Making progress";
    return `Focus on ${category.replace('_', ' ')}`;
  };

  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <CardDescription className="h-4 bg-gray-200 rounded"></CardDescription>
              <CardTitle className="h-8 bg-gray-200 rounded"></CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!dashboardData) {
    return <div>Failed to load dashboard data</div>;
  }

  const cardData = [
    {
      title: "Self-Awareness",
      score: dashboardData.scores.self_awareness,
      trend: dashboardData.trends.self_awareness,
      description: "Emotional recognition",
      encouragement: getEncouragementText(dashboardData.scores.self_awareness, "self_awareness")
    },
    {
      title: "Self-Regulation",
      score: dashboardData.scores.self_regulation,
      trend: dashboardData.trends.self_regulation,
      description: "Stress management",
      encouragement: getEncouragementText(dashboardData.scores.self_regulation, "self_regulation")
    },
    {
      title: "Motivation",
      score: dashboardData.scores.motivation,
      trend: dashboardData.trends.motivation,
      description: "Drive and initiative",
      encouragement: getMotivationText(dashboardData.scores.motivation)
    },
    {
      title: "Empathy",
      score: dashboardData.scores.empathy,
      trend: dashboardData.trends.empathy,
      description: "Understanding others",
      encouragement: getEncouragementText(dashboardData.scores.empathy, "empathy")
    },
    {
      title: "Social Skills",
      score: dashboardData.scores.social_skills,
      trend: dashboardData.trends.social_skills,
      description: "Relationship building",
      encouragement: getEncouragementText(dashboardData.scores.social_skills, "social_skills")
    }
  ];

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
      {cardData.map((card, index) => {
        const trendInfo = formatTrend(card.trend);
        const TrendIcon = trendInfo.icon;
        
        return (
          <Card key={index} className="@container/card">
            <CardHeader>
              <CardDescription>{card.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.score}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <TrendIcon className="w-4 h-4" />
                  {trendInfo.value}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {card.description} <TrendIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                {card.encouragement}
              </div>
            </CardFooter>
          </Card>
        );
      })}
      
      {dashboardData.offline && (
        <div className="col-span-full text-center text-sm text-muted-foreground">
          Using sample data - connect to backend for real analytics
        </div>
      )}
    </div>
  );
}
