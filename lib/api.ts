// API service layer for RaAI frontend-backend integration
import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Types for API responses
export interface User {
  _id: string
  email: string
  name: string
  role: 'user' | 'mentor' | 'counselor' | 'coordinator'
  team_id?: string
}

export interface Emotion {
  label: string
  score: number
}

export interface AnalysisResult {
  emotions: Emotion[]
  sentiment: number
  facet_signals: Record<string, number>
  topics: string[]
}

export interface ExerciseRecommendation {
  title: string
  description: string
  instructions: string[]
  duration: string
  target_facets: string[]
  context_tags: string[]
}

export interface BaselineQuestion {
  qid: string
  facet: string
  text: string
}

export interface BaselineAnswer {
  qid: string
  value: number
}

export interface BaselineScores {
  self_awareness: number
  self_regulation: number
  motivation: number
  empathy: number
  social_skills: number
}

export interface Challenge {
  _id: string
  team_id: string
  title: string
  description: string
  daily_tasks: string[]
  target_facets: string[]
  start_date: string
  end_date?: string
  created_by: string
  created_at: string
}

export interface CheckinQuestion {
  id: string
  text: string
  scale: string
}

export interface CheckinResponse {
  user_id: string
  date: string
  answers: Record<string, number>
  mood_index: number
  ema7: number
  ema14: number
  flag: 'SAFE' | 'ATTENTION' | 'ESCALATE'
}

export interface MoodSeriesData {
  date: string
  mood_index: number
  ema7: number
  ema14: number
  flag: string
}

export interface SafetyCheckResult {
  label: 'SAFE' | 'ATTENTION' | 'ESCALATE'
  message?: string
}

// API Client class
class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = API_BASE_URL
    // Try to get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for OAuth
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      toast.error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  // Health & Status
  async getHealth() {
    return this.request<{ status: string; retriever_ready: boolean }>('/health')
  }

  // Authentication
  async getMe(): Promise<User> {
    return this.request<User>('/auth/me')
  }

  async login() {
    // Redirect to backend OAuth login
    window.location.href = `${this.baseUrl}/auth/login`
  }

  // Analytics & Mood Tracking
  async getCheckinQuestions(): Promise<{ questions: CheckinQuestion[] }> {
    return this.request<{ questions: CheckinQuestion[] }>('/analytics/checkin/questions')
  }

  async submitCheckin(answers: Record<string, number>, userId: string): Promise<CheckinResponse> {
    return this.request<CheckinResponse>('/analytics/checkin', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        answers,
        date: new Date().toISOString().split('T')[0]
      })
    })
  }

  async getMoodSeries(userId: string, days: number = 30): Promise<{ series: MoodSeriesData[] }> {
    return this.request<{ series: MoodSeriesData[] }>(`/analytics/series?user_id=${userId}&days=${days}`)
  }

  async getTeamAnalytics(teamId: string) {
    return this.request(`/analytics/team?team_id=${teamId}`)
  }

  // Journal Analysis
  async analyzeJournalEntry(
    journal: string,
    mood?: string,
    context?: string
  ): Promise<{
    safety: SafetyCheckResult
    analysis?: AnalysisResult
    recommendation?: ExerciseRecommendation
    message?: string
  }> {
    return this.request('/ai/analyze-entry', {
      method: 'POST',
      body: JSON.stringify({ journal, mood, context })
    })
  }

  async getMoodScore(text: string): Promise<{ score: number }> {
    return this.request('/ai/mood-score', {
      method: 'POST',
      body: JSON.stringify({ text })
    })
  }

  // Baseline Assessment
  async getBaselineQuestions(): Promise<{ questions: BaselineQuestion[] }> {
    return this.request('/ai/get-baseline-questions')
  }

  async scoreBaseline(answers: BaselineAnswer[]): Promise<{
    scores: BaselineScores
    strengths: string[]
    focus: string[]
    summary: string
  }> {
    return this.request('/ai/score-baseline', {
      method: 'POST',
      body: JSON.stringify({ answers })
    })
  }

  // Exercise & Recommendations
  async getExercise(
    targetFacets: string[],
    contextTags: string[] = [],
    durationHint: string = '5min'
  ): Promise<{ exercise: ExerciseRecommendation }> {
    return this.request('/ai/get-exercise', {
      method: 'POST',
      body: JSON.stringify({
        target_facets: targetFacets,
        context_tags: contextTags,
        duration_hint: durationHint
      })
    })
  }

  // Coaching
  async getCoachQuestion(state: {
    facet: string
    emotions: Emotion[]
    lastEntrySummary?: string
  }): Promise<{ question: string }> {
    return this.request('/ai/coach-question', {
      method: 'POST',
      body: JSON.stringify({
        state,
        user_id: 'current' // Will be handled by backend auth
      })
    })
  }

  async getCoachReply(state: {
    facet: string
    lastEntrySummary: string
  }): Promise<{ question: string; insight_line?: string }> {
    return this.request('/ai/coach-reply', {
      method: 'POST',
      body: JSON.stringify({
        state,
        user_id: 'current'
      })
    })
  }

  // Challenges
  async createChallenge(challenge: {
    team_id?: string
    target_facets: string[]
    team_context?: string
    start_date?: string
    end_date?: string
    use_template?: boolean
    challenge_data?: Record<string, unknown>
  }): Promise<Challenge> {
    return this.request('/challenges/create', {
      method: 'POST',
      body: JSON.stringify(challenge)
    })
  }

  async joinChallenge(challengeId: string) {
    return this.request('/challenges/join', {
      method: 'POST',
      body: JSON.stringify({ challenge_id: challengeId })
    })
  }

  async completeChallengeDay(challengeId: string) {
    return this.request('/challenges/complete', {
      method: 'POST',
      body: JSON.stringify({ challenge_id: challengeId })
    })
  }

  async getChallengeLeaderboard(challengeId: string) {
    return this.request(`/challenges/leaderboard?challenge_id=${challengeId}`)
  }

  // Mentorship
  async findMentorMatches(k: number = 5) {
    return this.request('/mentors/match', {
      method: 'POST',
      body: JSON.stringify({ k })
    })
  }

  async acceptMentorMatch(mentorId: string) {
    return this.request('/mentors/accept', {
      method: 'POST',
      body: JSON.stringify({ mentor_id: mentorId })
    })
  }

  // Collaboration Tools
  async rewriteMessage(text: string, intent: string = 'assertive_kind') {
    return this.request('/collab/rewrite', {
      method: 'POST',
      body: JSON.stringify({ text, intent })
    })
  }

  async meetingDebrief(notes: string) {
    return this.request('/collab/debrief', {
      method: 'POST',
      body: JSON.stringify({ notes })
    })
  }

  // Crisis Support
  async getCrisisResources(locale: string = 'en', topic?: string) {
    const params = new URLSearchParams({ locale })
    if (topic) params.append('topic', topic)
    return this.request(`/crisis/resources?${params}`)
  }

  // Safety Check
  async safetyCheck(text: string): Promise<SafetyCheckResult> {
    return this.request('/ai/safety-check', {
      method: 'POST',
      body: JSON.stringify({ text })
    })
  }

  // RAG Document Management
  async uploadDocuments(files: File[]) {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    
    return fetch(`${this.baseUrl}/rag/ingest`, {
      method: 'POST',
      body: formData,
      headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {},
      credentials: 'include'
    }).then(response => {
      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`)
      return response.json()
    })
  }

  async getRagStatus() {
    return this.request<{ retriever_ready: boolean; vectorstore_dir: string }>('/rag/status')
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient()

// Utility functions for common operations
export const authUtils = {
  async checkAuth(): Promise<User | null> {
    try {
      return await apiClient.getMe()
    } catch {
      return null
    }
  },

  async requireAuth(): Promise<User> {
    const user = await this.checkAuth()
    if (!user) {
      throw new Error('Authentication required')
    }
    return user
  },

  login: () => apiClient.login(),
  logout: () => apiClient.clearToken()
}

export const moodUtils = {
  async quickMoodCheck(text: string): Promise<number> {
    const result = await apiClient.getMoodScore(text)
    return result.score
  },

  async fullAnalysis(journal: string, mood?: string) {
    return apiClient.analyzeJournalEntry(journal, mood)
  },

  getSentimentLabel(score: number): string {
    if (score > 7) return 'Very Positive'
    if (score > 5.5) return 'Positive'
    if (score > 4.5) return 'Neutral'
    if (score > 3) return 'Negative'
    return 'Very Negative'
  },

  getSentimentColor(score: number): string {
    if (score > 7) return 'text-green-600'
    if (score > 5.5) return 'text-green-500'
    if (score > 4.5) return 'text-yellow-500'
    if (score > 3) return 'text-orange-500'
    return 'text-red-500'
  }
}

export const exerciseUtils = {
  async getPersonalizedExercise(
    analysis: AnalysisResult,
    durationPreference: string = '5min'
  ): Promise<ExerciseRecommendation> {
    // Determine target facets from analysis
    const facetScores = Object.entries(analysis.facet_signals)
      .sort(([, a], [, b]) => a - b) // Sort by score (ascending = needs work)
    
    const targetFacets = facetScores.slice(0, 2).map(([facet]) => facet)
    const contextTags = analysis.topics.slice(0, 2)
    
    const result = await apiClient.getExercise(targetFacets, contextTags, durationPreference)
    return result.exercise
  }
}

// Error handling utilities
export const errorUtils = {
  isNetworkError(error: unknown): boolean {
    return error instanceof Error && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network request failed')
    )
  },

  isAuthError(error: unknown): boolean {
    return error instanceof Error && (
      error.message.includes('401') ||
      error.message.includes('403') ||
      error.message.includes('Authentication')
    )
  },

  handleApiError(error: unknown, context: string = 'Operation') {
    console.error(`${context} failed:`, error)
    
    if (this.isNetworkError(error)) {
      toast.error('Network error. Please check your connection.')
    } else if (this.isAuthError(error)) {
      toast.error('Authentication required. Please log in.')
      authUtils.login()
    } else {
      toast.error(`${context} failed. Please try again.`)
    }
  }
}