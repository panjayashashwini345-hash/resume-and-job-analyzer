"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAppStore } from "@/lib/store"
import {
  FileText,
  Search,
  Brain,
  BarChart3,
  Target,
  ClipboardList,
  CheckCircle2,
  Loader2,
} from "lucide-react"

const STEPS = [
  { Icon: FileText, label: "Parsing resume PDF" },
  { Icon: Search, label: "Reading job description" },
  { Icon: Brain, label: "Analyzing skill match with GPT-4o" },
  { Icon: BarChart3, label: "Scoring technical & soft skills" },
  { Icon: Target, label: "Generating quiz & interview questions" },
  { Icon: ClipboardList, label: "Building your prep plan" },
]

export function LoadingOverlay() {
  const { uiState, loadingStep } = useAppStore()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (uiState !== "loading") {
      setElapsed(0)
      return
    }
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [uiState])

  if (uiState !== "loading") return null

  const total = STEPS.length
  const progress = Math.min(100, ((loadingStep + 1) / total) * 100)
  const eta = Math.max(2, 25 - elapsed)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-6"
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-lg rounded-2xl glass-strong p-7"
        >
          <div className="mb-5 text-center">
            <h3 className="font-display text-xl font-semibold">
              Analyzing your fit
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {elapsed > 0 ? `~${eta}s remaining` : "Just a moment…"}
            </p>
          </div>

          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
            />
          </div>

          <ul className="space-y-3">
            {STEPS.map((s, i) => {
              const done = i < loadingStep
              const active = i === loadingStep
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{
                    opacity: done || active ? 1 : 0.4,
                    x: 0,
                  }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      done
                        ? "bg-emerald-500/15 text-emerald-400"
                        : active
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : active ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <s.Icon className="h-4 w-4" />
                    )}
                  </span>
                  <span
                    className={
                      done || active ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {s.label}
                    {active ? "…" : ""}
                  </span>
                </motion.li>
              )
            })}
          </ul>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
