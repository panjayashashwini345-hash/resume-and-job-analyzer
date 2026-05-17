"use client"

import { useAppStore, type PracticeMode } from "@/lib/store"
import { motion } from "framer-motion"
import { Brain, MessagesSquare, Zap, Mic } from "lucide-react"

const modes: {
  id: PracticeMode
  title: string
  desc: string
  Icon: typeof Brain
  Accent: typeof Zap
}[] = [
  {
    id: "quiz",
    title: "Quiz Mode",
    desc: "8 MCQ questions with instant scoring",
    Icon: Brain,
    Accent: Zap,
  },
  {
    id: "chatbot",
    title: "AI Interview",
    desc: "Live conversation with an AI interviewer",
    Icon: MessagesSquare,
    Accent: Mic,
  },
]

export function PracticeModeSelect() {
  const { practiceMode, setPracticeMode } = useAppStore()
  return (
    <div className="space-y-3">
      <h3 className="font-display text-lg font-semibold">Practice Mode</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {modes.map((m) => {
          const active = practiceMode === m.id
          return (
            <motion.button
              key={m.id}
              type="button"
              onClick={() => setPracticeMode(m.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden rounded-xl p-5 text-left transition-all ${
                active
                  ? "border-2 border-primary bg-primary/5 shadow-[0_0_30px_rgba(99,102,241,0.25)]"
                  : "border border-border bg-card/40 hover:border-primary/40"
              }`}
            >
              {active && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
              )}
              <div className="relative flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <m.Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-semibold">{m.title}</h4>
                    <m.Accent
                      className={`h-3.5 w-3.5 ${
                        active ? "text-accent" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                </div>
                <div
                  className={`mt-1 h-4 w-4 shrink-0 rounded-full border-2 transition-all ${
                    active
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="dot"
                      className="h-full w-full rounded-full bg-primary-foreground scale-50"
                    />
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
