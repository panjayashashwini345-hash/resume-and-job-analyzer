"use client"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Brain, MessagesSquare } from "lucide-react"
import { QuizMode } from "./quiz-mode"
import { ChatbotMode } from "./chatbot-mode"

export function PracticeTab() {
  const { practiceMode, setPracticeMode } = useAppStore()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="inline-flex rounded-full glass p-1">
          <Button
            variant={practiceMode === "quiz" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPracticeMode("quiz")}
            className={
              practiceMode === "quiz"
                ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0"
                : ""
            }
          >
            <Brain className="h-4 w-4" /> Quiz
          </Button>
          <Button
            variant={practiceMode === "chatbot" ? "default" : "ghost"}
            size="sm"
            onClick={() => setPracticeMode("chatbot")}
            className={
              practiceMode === "chatbot"
                ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0"
                : ""
            }
          >
            <MessagesSquare className="h-4 w-4" /> AI Interview
          </Button>
        </div>
      </div>
      {practiceMode === "quiz" ? <QuizMode /> : <ChatbotMode />}
    </div>
  )
}
