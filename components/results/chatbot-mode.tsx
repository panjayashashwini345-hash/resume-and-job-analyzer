"use client"

import { useEffect, useRef, useState } from "react"
import { useAppStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, Sparkles, Square, Loader2 } from "lucide-react"
import { streamInterviewReply } from "@/lib/openai-client"
import { toast } from "sonner"

export function ChatbotMode() {
  const data = useAppStore((s) => s.analysisData)!
  const { apiKey, chatState, setChatState } = useAppStore()
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Kick off with first question
  useEffect(() => {
    if (chatState.messages.length === 0 && data.chatQuestions.length > 0) {
      setChatState({
        ...chatState,
        messages: [
          {
            role: "assistant",
            content: `Hi ${data.candidateName}, welcome! I'll be your AI interviewer for the ${data.jobTitle} role at ${data.company}. Let's start with the first question:\n\n${data.chatQuestions[0]}`,
          },
        ],
        questionIndex: 0,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement | null
    if (el) el.scrollTop = el.scrollHeight
  }, [chatState.messages])

  async function send() {
    if (!input.trim() || streaming || chatState.done) return
    const userMsg = { role: "user" as const, content: input.trim() }
    const newMessages = [...chatState.messages, userMsg]
    setChatState({ ...chatState, messages: newMessages })
    setInput("")
    setStreaming(true)

    const nextIdx = chatState.questionIndex + 1
    const nextQuestion =
      nextIdx < data.chatQuestions.length ? data.chatQuestions[nextIdx] : null

    // Add empty assistant message that we'll fill via streaming
    const assistantMsg = { role: "assistant" as const, content: "" }
    setChatState({
      ...chatState,
      messages: [...newMessages, assistantMsg],
    })

    try {
      let acc = ""
      await streamInterviewReply({
        apiKey,
        jobTitle: data.jobTitle,
        history: newMessages,
        nextQuestion,
        onDelta: (d) => {
          acc += d
          setChatState({
            ...useAppStore.getState().chatState,
            messages: [
              ...newMessages,
              { role: "assistant", content: acc },
            ],
          })
        },
      })
      const isDone = nextQuestion === null
      setChatState({
        ...useAppStore.getState().chatState,
        questionIndex: isDone ? chatState.questionIndex : nextIdx,
        done: isDone,
      })
    } catch (e: any) {
      toast.error(e?.message || "Stream failed")
    } finally {
      setStreaming(false)
    }
  }

  function endInterview() {
    setChatState({ ...chatState, done: true })
  }

  if (chatState.done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-md rounded-2xl glass-strong p-8 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h3 className="font-display text-2xl font-bold mt-4">
          Interview Complete
        </h3>
        <p className="text-muted-foreground mt-2">
          You answered{" "}
          <span className="text-foreground font-semibold">
            {chatState.messages.filter((m) => m.role === "user").length}
          </span>{" "}
          questions. Review your transcript above and use the feedback to refine
          your answers.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl glass-strong overflow-hidden flex flex-col">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Interviewer</p>
            <p className="text-xs text-muted-foreground">
              Question {Math.min(chatState.questionIndex + 1, data.chatQuestions.length)} of{" "}
              {data.chatQuestions.length}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={endInterview}>
          <Square className="h-3.5 w-3.5" /> End
        </Button>
      </div>

      <ScrollArea ref={scrollRef} className="h-[420px] px-5 py-4">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {chatState.messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {m.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-[10px] font-bold text-white">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-indigo-500 to-cyan-500 text-white rounded-tr-sm"
                      : "bg-muted/60 border border-border/40 rounded-tl-sm"
                  }`}
                >
                  {m.content || (streaming && i === chatState.messages.length - 1 ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="border-t border-border/60 p-3 flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder="Type your answer…"
          rows={1}
          className="min-h-[44px] max-h-32 resize-none bg-muted/30 border-border/50"
        />
        <Button
          onClick={send}
          disabled={streaming || !input.trim()}
          className="h-11 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0"
        >
          {streaming ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}
