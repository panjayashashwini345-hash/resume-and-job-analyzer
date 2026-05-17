"use client"

import { create } from "zustand"

export type PracticeMode = "quiz" | "chatbot"
export type UIState = "input" | "loading" | "results"

export interface ResumeIssue {
  priority: "HIGH" | "MED" | "LOW"
  title: string
  description: string
}

export interface InterviewRound {
  round: string
  type: string
  tips: string
  keyTopics: string[]
}

export interface QuizQuestion {
  question: string
  options: string[]
  answer: number
  explanation: string
}

export interface Improvement {
  priority: "HIGH" | "MED" | "LOW"
  title: string
  description: string
}

export interface PrepWeek {
  week: number
  focus: string
  tasks: string[]
}

export interface AnalysisData {
  jobTitle: string
  company: string
  candidateName: string
  overallScore: number
  technicalScore: number
  experienceScore: number
  softSkillsScore: number
  matchedSkills: string[]
  missingSkills: string[]
  partialSkills: string[]
  resumeIssues: ResumeIssue[]
  interviewRounds: InterviewRound[]
  quiz: QuizQuestion[]
  chatQuestions: string[]
  improvements: Improvement[]
  prepPlan: PrepWeek[]
  totalPrepWeeks: number
  verdict: "Strong Fit" | "Good Fit" | "Partial Fit" | "Needs Work"
  verdictReason: string
  summary: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface AppState {
  // Inputs
  resumeFile: File | null
  resumeText: string
  jobText: string
  jobUrl: string
  apiKey: string
  practiceMode: PracticeMode

  // Output
  analysisData: AnalysisData | null

  // UI
  uiState: UIState
  loadingStep: number

  // Quiz
  quizState: {
    currentQ: number
    answers: number[]
    score: number
    done: boolean
  }

  // Chat
  chatState: {
    messages: ChatMessage[]
    questionIndex: number
    done: boolean
  }

  // Setters
  setResumeFile: (f: File | null) => void
  setResumeText: (t: string) => void
  setJobText: (t: string) => void
  setJobUrl: (t: string) => void
  setApiKey: (t: string) => void
  setPracticeMode: (m: PracticeMode) => void
  setAnalysisData: (d: AnalysisData | null) => void
  setUIState: (s: UIState) => void
  setLoadingStep: (n: number) => void
  setQuizState: (s: AppState["quizState"]) => void
  setChatState: (s: AppState["chatState"]) => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  resumeFile: null,
  resumeText: "",
  jobText: "",
  jobUrl: "",
  apiKey: "",
  practiceMode: "quiz",
  analysisData: null,
  uiState: "input",
  loadingStep: 0,
  quizState: { currentQ: 0, answers: [], score: 0, done: false },
  chatState: { messages: [], questionIndex: 0, done: false },

  setResumeFile: (resumeFile) => set({ resumeFile }),
  setResumeText: (resumeText) => set({ resumeText }),
  setJobText: (jobText) => set({ jobText }),
  setJobUrl: (jobUrl) => set({ jobUrl }),
  setApiKey: (apiKey) => set({ apiKey }),
  setPracticeMode: (practiceMode) => set({ practiceMode }),
  setAnalysisData: (analysisData) => set({ analysisData }),
  setUIState: (uiState) => set({ uiState }),
  setLoadingStep: (loadingStep) => set({ loadingStep }),
  setQuizState: (quizState) => set({ quizState }),
  setChatState: (chatState) => set({ chatState }),
  reset: () =>
    set({
      resumeFile: null,
      resumeText: "",
      jobText: "",
      jobUrl: "",
      analysisData: null,
      uiState: "input",
      loadingStep: 0,
      quizState: { currentQ: 0, answers: [], score: 0, done: false },
      chatState: { messages: [], questionIndex: 0, done: false },
    }),
}))
