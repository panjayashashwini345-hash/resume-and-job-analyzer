"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, MessageCircle, Send, Sparkles, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type Msg = { role: "user" | "assistant"; content: string }

const QUICK_PROMPTS = [
  "How do I answer 'Tell me about yourself'?",
  "Tips for technical interviews",
  "How to negotiate salary?",
  "What is system design?",
  "How to explain gaps in resume?",
]

export function AskAce() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(true), 3000)
    const t2 = setTimeout(() => setShowTooltip(false), 12000)
    return () => {
      clearTimeout(t)
      clearTimeout(t2)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streaming])

  async function sendPrompt(text: string) {
    if (!text.trim() || streaming) return
    setError(null)
    const userMsg: Msg = { role: "user", content: text.trim() }
    const next = [...messages, userMsg]
    setMessages([...next, { role: "assistant", content: "" }])
    setInput("")
    setStreaming(true)

    try {
      const res = await fetch("/api/ask-ace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      })
      if (!res.ok || !res.body) {
        let msg = "Request failed"
        try {
          const j = await res.json()
          msg = j?.error || msg
        } catch {}
        throw new Error(msg)
      }
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      let acc = ""
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = dec.decode(value, { stream: true })
        acc += chunk
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: "assistant", content: acc }
          return copy
        })
      }
    } catch (e: any) {
      setError(e?.message || "Failed to reach Ace")
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setStreaming(false)
    }
  }

  function clearChat() {
    if (!confirmingClear) {
      setConfirmingClear(true)
      setTimeout(() => setConfirmingClear(false), 2500)
      return
    }
    setMessages([])
    setError(null)
    setConfirmingClear(false)
  }

  return (
    <>
      {/* Launcher */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {showTooltip && !open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-2xl glass-strong px-4 py-3 text-sm shadow-2xl max-w-[240px] relative"
            >
              <p className="leading-snug">
                Need help preparing? <span className="gradient-text font-semibold">Ask me!</span>
              </p>
              <span className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-r border-b border-border bg-[rgba(15,20,40,0.6)]" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setOpen(true)
                setShowTooltip(false)
              }}
              className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 pl-2 pr-4 py-2 shadow-2xl avatar-pulse"
              aria-label="Open Ask Ace chatbot"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                <Bot className="h-5 w-5 text-white" />
              </span>
              <span className="font-display text-sm font-semibold text-white">
                Ask Ace
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-0"
            />
            <motion.aside
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="fixed bottom-0 right-0 z-50 flex h-[88vh] w-full flex-col rounded-t-3xl glass-strong shadow-2xl md:right-5 md:bottom-5 md:h-[640px] md:w-[420px] md:rounded-3xl"
            >
              {/* Header */}
              <header className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg">
                      <Bot className="h-5 w-5 text-white" />
                    </span>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#0f1428]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold leading-tight">
                      Ace
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Your Interview Coach
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearChat}
                      className="h-8 gap-1 text-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {confirmingClear ? "Confirm?" : "Clear"}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </header>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
              >
                {messages.length === 0 && (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-semibold">
                          Hi! I&apos;m Ace.
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Ask me anything about interview prep — behavioral
                        questions, technical rounds, salary negotiation, and
                        more.
                      </p>
                    </div>
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
                        Try a quick prompt
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_PROMPTS.map((p) => (
                          <button
                            key={p}
                            onClick={() => sendPrompt(p)}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-foreground transition-colors"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <MessageBubble
                    key={i}
                    role={m.role}
                    content={m.content}
                    streaming={
                      streaming &&
                      i === messages.length - 1 &&
                      m.role === "assistant"
                    }
                  />
                ))}

                {error && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300">
                    <p className="mb-2">{error}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const last = [...messages]
                          .reverse()
                          .find((m) => m.role === "user")
                        if (last) sendPrompt(last.content)
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendPrompt(input)
                }}
                className="border-t border-border/60 p-3"
              >
                <div className="flex items-end gap-2 rounded-2xl bg-white/5 border border-white/10 p-2 focus-within:border-violet-500/60 focus-within:shadow-[0_0_0_3px_rgba(124,58,237,0.15)] transition-all">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendPrompt(input)
                      }
                    }}
                    placeholder="Ask Ace anything..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground max-h-32"
                    disabled={streaming}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={streaming || !input.trim()}
                    className="h-9 w-9 shrink-0 bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function MessageBubble({
  role,
  content,
  streaming,
}: {
  role: "user" | "assistant"
  content: string
  streaming?: boolean
}) {
  const isUser = role === "user"
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <span className="mr-2 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500">
          <Bot className="h-3.5 w-3.5 text-white" />
        </span>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-violet-600 to-violet-500 text-white"
            : "bg-white/5 border border-white/10 text-foreground"
        }`}
      >
        {content || (streaming ? <TypingDots /> : "")}
        {streaming && content && (
          <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-current align-middle" />
        )}
      </div>
    </motion.div>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex items-center py-1">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </span>
  )
}
