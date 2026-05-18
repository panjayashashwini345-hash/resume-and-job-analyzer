"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import {
  Target,
  Brain,
  Wrench,
  CalendarRange,
  Sparkles,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SkillsAndRoundsTab } from "./results/skills-and-rounds-tab"
import { PracticeTab } from "./results/practice-tab"
import { ImprovementsTab } from "./results/improvements-tab"
import { PrepPlanTab } from "./results/prep-plan-tab"
import { SummaryTab } from "./results/summary-tab"

const TABS = [
  { id: "fit", label: "Skills & Rounds", Icon: Target, Component: SkillsAndRoundsTab },
  { id: "practice", label: "Practice", Icon: Brain, Component: PracticeTab },
  { id: "improvements", label: "Improvements", Icon: Wrench, Component: ImprovementsTab },
  { id: "prep", label: "Prep Plan", Icon: CalendarRange, Component: PrepPlanTab },
  { id: "summary", label: "Summary", Icon: Sparkles, Component: SummaryTab },
] as const

export function ResultsPanel() {
  const { uiState, reset, analysisData } = useAppStore()
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("fit")

  if (uiState !== "results" || !analysisData) return null

  const ActiveComp =
    TABS.find((t) => t.id === active)?.Component || SkillsAndRoundsTab

  return (
    <section className="relative mx-auto max-w-6xl px-4 md:px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> New Analysis
        </Button>
        <div className="text-xs text-muted-foreground hidden md:block">
          {analysisData.candidateName} · {analysisData.jobTitle} @{" "}
          {analysisData.company}
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-2 z-30 mb-6">
        <div className="glass-strong rounded-2xl p-1.5 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {TABS.map((t) => {
              const isActive = active === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`relative flex items-center gap-1.5 px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="tab-indicator"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    <t.Icon className="h-4 w-4" />
                    {t.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <ActiveComp />
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
