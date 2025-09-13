'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  IconEdit, 
  IconMicrophone, 
  IconPhoto, 
  IconBrain, 
  IconMoodHappy, 
  IconChartBar, 
  IconTarget, 
  IconBulb, 
  IconSparkles, 
  IconPlayerPlay, 
  IconRefresh, 
  IconDeviceFloppy,
  IconRobot,
  IconAlertTriangle
} from "@tabler/icons-react"
import Link from "next/link"
import { toast } from "sonner"
import { apiClient, moodUtils, errorUtils, type ExerciseRecommendation } from "@/lib/api"

interface JournalAnalysisResult {
  emotions: Array<{ label: string; score: number }>
  sentiment: number
  facet_signals: Record<string, number>
  topics: string[]
}

interface SafetyResult {
  label: 'SAFE' | 'ATTENTION' | 'ESCALATE'
  message?: string
}

export default function JournalPage() {
  const [journalText, setJournalText] = useState("")
  const [analysis, setAnalysis] = useState<JournalAnalysisResult | null>(null)
  const [recommendation, setRecommendation] = useState<ExerciseRecommendation | null>(null)
  const [safetyResult, setSafetyResult] = useState<SafetyResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [moodScore, setMoodScore] = useState<number | null>(null)

  const handleVoiceNote = () => {
    toast.info("Voice recording feature coming soon!")
  }

  const handlePhotoAttachment = () => {
    toast.info("Photo attachment feature coming soon!")
  }

  const handleAnalyze = async () => {
    if (!journalText.trim()) {
      toast.error("Please write something in your journal first")
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Get comprehensive analysis from backend
      const result = await apiClient.analyzeJournalEntry(journalText)
      
      setSafetyResult(result.safety)
      
      if (result.safety.label === 'ESCALATE') {
        toast.error("Please reach out for support if you're in crisis")
        setAnalysis(null)
        setRecommendation(null)
      } else {
        setAnalysis(result.analysis as JournalAnalysisResult)
        setRecommendation(result.recommendation || null)
        
        // Also get mood score
        const scoreResult = await apiClient.getMoodScore(journalText)
        setMoodScore(scoreResult.score)
        
        toast.success("Analysis complete!")
      }
    } catch (error) {
      errorUtils.handleApiError(error, "Journal analysis")
      setAnalysis(null)
      setRecommendation(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getFacetLabel = (facet: string) => {
    const labels: Record<string, string> = {
      'self_awareness': 'Self Awareness',
      'self_regulation': 'Self Regulation',
      'motivation': 'Motivation',
      'empathy': 'Empathy',
      'social_skills': 'Social Skills'
    }
    return labels[facet] || facet
  }

  const handleSaveEntry = async () => {
    try {
      // Save to localStorage for now
      const entryData = {
        date: new Date().toISOString(),
        text: journalText,
        analysis,
        recommendation,
        moodScore,
        safetyResult
      }
      
      localStorage.setItem('lastJournalEntry', JSON.stringify(entryData))
      
      // In the future, this would save to the backend database
      toast.success("Journal entry saved!")
    } catch (error) {
      console.error('Failed to save journal entry:', error)
      toast.error("Failed to save journal entry")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <IconEdit className="h-6 w-6 text-blue-500" />
            <CardTitle className="text-2xl">Daily Reflection</CardTitle>
          </div>
          <CardDescription>
            Share your thoughts and get AI-powered emotional insights
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Journal Input */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">How was your day?</h3>
            <Textarea
              placeholder="I had a challenging meeting with my team today. I felt frustrated when they disagreed with my proposal..."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              className="min-h-[150px] text-base"
            />
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleVoiceNote}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <IconMicrophone className="h-4 w-4" />
                Voice Note
              </Button>
              <Button
                onClick={handlePhotoAttachment}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <IconPhoto className="h-4 w-4" />
                Add Photo
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={!journalText.trim() || isAnalyzing}
                className="flex items-center gap-2"
              >
                <IconBrain className="h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </div>

          {/* Safety Alert */}
          {safetyResult && safetyResult.label === 'ESCALATE' && (
            <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <IconAlertTriangle className="h-5 w-5" />
                  <h4 className="font-medium">Crisis Support Available</h4>
                </div>
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {safetyResult.message || "If you're in crisis, please reach out for immediate support."}
                </p>
                <div className="mt-4">
                  <Link href="/crisis" className="text-sm underline text-red-600 dark:text-red-400">
                    View Crisis Resources →
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mood Score */}
          {moodScore !== null && (
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <IconChartBar className="h-4 w-4" />
                    Mood Score
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{moodScore.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">/10</span>
                  </div>
                </div>
                <div className="mt-2 flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(moodScore / 10) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {moodUtils.getSentimentLabel(moodScore)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {analysis && (
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconRobot className="h-5 w-5 text-blue-500" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Emotions Detected */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <IconMoodHappy className="h-4 w-4" />
                    Emotions Detected
                  </h4>
                  <div className="space-y-2">
                    {analysis.emotions.slice(0, 5).map((emotion, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{emotion.label}</span>
                        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${emotion.score * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {(emotion.score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emotional Intelligence Facets */}
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <IconTarget className="h-4 w-4" />
                    EQ Facet Analysis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(analysis.facet_signals).map(([facet, score]) => (
                      <div key={facet} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{getFacetLabel(facet)}</span>
                          <span className="text-sm text-muted-foreground">{score.toFixed(1)}</span>
                        </div>
                        <div className="bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              score > 0.6 ? 'bg-green-500' : 
                              score > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.max(score * 100, 10)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topics Identified */}
                {analysis.topics.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <IconBulb className="h-4 w-4" />
                      Key Topics
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.topics.map((topic, index) => (
                        <Badge key={index} variant="outline">{topic}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Exercise Recommendation */}
          {recommendation && (
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconSparkles className="h-5 w-5 text-green-500" />
                  Recommended Exercise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg">{recommendation.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{recommendation.description}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="secondary">{recommendation.duration}</Badge>
                  <span>Targets: {recommendation.target_facets.join(', ')}</span>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium">Instructions:</h5>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    {recommendation.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Link href="/exercise" className="flex-1">
                    <Button className="w-full flex items-center gap-2">
                      <IconPlayerPlay className="h-4 w-4" />
                      Start Exercise
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handleSaveEntry}
              disabled={!journalText.trim()}
              className="flex items-center gap-2"
            >
              <IconDeviceFloppy className="h-4 w-4" />
              Save Entry
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleAnalyze}
              disabled={!journalText.trim() || isAnalyzing}
            >
              <IconRefresh className="h-4 w-4" />
              Re-analyze
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}