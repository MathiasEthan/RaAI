'use client'
import React, { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { 
  IconSos, 
  IconPhone, 
  IconMessage, 
  IconAlertTriangle 
} from "@tabler/icons-react"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";


type MoodEntry = {
  date: string; // storing ISO string since you’re saving via toISOString()
  score: number;
};

const MoodIndexPage = () => {

    const [moodInput, setMoodInput] = useState("");
  const [weeklyMoods, setWeeklyMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
   
      
 

  // Format weekly data for chart
  const formatDataForChart = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];

    // Start of current week (Monday)
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    if (dayOfWeek === 0) {
      startOfWeek.setDate(today.getDate() - 6);
    } else {
      startOfWeek.setDate(today.getDate() - dayOfWeek + 1);
    }

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      const mood = weeklyMoods.find(m => {
        const moodDate = new Date(m.date);
        return (
          moodDate.getDate() === date.getDate() &&
          moodDate.getMonth() === date.getMonth()
        );
      });

      data.push({
        day: dayNames[date.getDay()],
        score: mood ? mood.score : null,
      });
    }
    return data;
  };

  // Handle user input submit
  const handleSubmit = async () => {
    if (moodInput.trim() === "") {
      setError("Please enter your vibe for the day.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:8000/ai/mood-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: moodInput }),
      });

      if (!res.ok) throw new Error("Failed to fetch mood score");

      const data = await res.json();

      // Save today's mood
      const newMood = {
        date: new Date().toISOString(),
        score: data.score,
      };

      setWeeklyMoods(prev => [...prev, newMood]);
      setMoodInput("");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching mood score.");
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    score: {
      label: "Mood Score",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <>
      
      <h2>Vibe of the day....</h2>
      <Textarea
        className="mdindex-txtarea"
        value={moodInput}
        onChange={(e) => setMoodInput(e.target.value)}
      ></Textarea>
      <button
        className="mdindex-submit-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Submit"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {weeklyMoods.length > 0 && (
        <Card className="w-full max-w-md mt-6 p-6 space-y-4">
          <h3 className="text-xl font-semibold text-center">
            Your Weekly Mood Tracker
          </h3>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <LineChart
              data={formatDataForChart()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-score)"
                strokeWidth={2}
                dot={{
                  r: 6,
                  fill: "var(--color-score)",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                  fill: "var(--color-score)",
                  stroke: "var(--color-score)",
                  strokeWidth: 4,
                }}
                connectNulls={true}
              />
            </LineChart>
          </ChartContainer>
        </Card>
      )}

      {/* Crisis Support Section */}
      <div className="w-full max-w-md mt-8 p-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3 text-center flex items-center justify-center gap-2">
          <IconSos className="h-5 w-5" />
          Need Support?
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4 text-center">
          If you&apos;re struggling, help is available 24/7
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 flex items-center gap-2"
              onClick={() => window.open('tel:988', '_blank')}
            >
              <IconPhone className="h-4 w-4" />
              Call 988 Crisis Line
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 flex items-center gap-2"
              onClick={() => window.open('sms:741741', '_blank')}
            >
              <IconMessage className="h-4 w-4" />
              Text HOME to 741741
            </Button>
          </div>
          <div className="text-center">
            <Button 
              size="sm" 
              variant="destructive"
              className="flex items-center gap-2"
              onClick={() => window.open('tel:911', '_blank')}
            >
              <IconAlertTriangle className="h-4 w-4" />
              Emergency: Call 911
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default MoodIndexPage
