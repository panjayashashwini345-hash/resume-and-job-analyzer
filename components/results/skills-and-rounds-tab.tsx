"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { ScoreRing } from "@/components/score-ring"
import { motion } from "framer-motion"
import { Check, X, CircleAlert, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

export function SkillsAndRoundsTab() {
  const data = useAppStore((s) => s.analysisData)
  const [highlightedSkill, setHighlightedSkill] = useState<string | null>(null)

  if (!data) return null

  const radarData = [
    { axis: "Technical", value: data.technicalScore, full: 100 },
    { axis: "Experience", value: data.experienceScore, full: 100 },
    { axis: "Soft Skills", value: data.softSkillsScore, full: 100 },
    {
      axis: "Skills Match",
      value:
        data.matchedSkills.length + data.partialSkills.length + data.missingSkills.length === 0
          ? 0
          : Math.round(
              ((data.matchedSkills.length + data.partialSkills.length * 0.5) /
                Math.max(
                  1,
                  data.matchedSkills.length +
                    data.partialSkills.length +
                    data.missingSkills.length,
                )) *
                100,
            ),
      full: 100,
    },
    { axis: "Overall", value: data.overallScore, full: 100 },
  ]

  // Heuristic: link a skill to a round if its name shows up in the round tips/topics
  function relatedRoundsFor(skill: string) {
    const s = skill.toLowerCase()
    return data.interviewRounds
      .map((r, i) => ({ r, i }))
      .filter(
        ({ r }) =>
          r.tips.toLowerCase().includes(s) ||
          r.keyTopics.some((t) => t.toLowerCase().includes(s)),
      )
      .map(({ i }) => i)
  }

  const highlightedRounds = highlightedSkill
    ? new Set(relatedRoundsFor(highlightedSkill))
    : new Set<number>()

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Hero score row */}
      <motion.div
        variants={item}
        className="rounded-2xl glass p-6 md:p-8 flex flex-col md:flex-row items-center gap-8"
      >
        <ScoreRing value={data.overallScore} size={200} label="Overall Match" />
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-display text-2xl font-bold">
            {data.candidateName} for {data.jobTitle}
          </h3>
          <p className="text-muted-foreground mt-1">{data.company}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground/90">
            {data.summary}
          </p>
        </div>
      </motion.div>

      {/* Two-column merged view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Skills & Fit */}
        <motion.div variants={item} className="space-y-6">
          <div className="rounded-2xl glass p-6">
            <h3 className="font-display text-lg font-semibold mb-4">
              Skill Coverage
            </h3>
            <div className="h-64 -mx-2">
              <ResponsiveContainer>
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="rgba(255,255,255,0.12)" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fill: "rgb(148 163 184)", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name="You"
                    dataKey="value"
                    stroke="#7C3AED"
                    fill="#7C3AED"
                    fillOpacity={0.35}
                  />
                  <Radar
                    name="Target"
                    dataKey="full"
                    stroke="#06B6D4"
                    fill="#06B6D4"
                    fillOpacity={0.04}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl glass p-6 space-y-5">
            <h3 className="font-display text-lg font-semibold">
              Skill Bars
            </h3>
            <ScoreBar label="Technical" value={data.technicalScore} />
            <ScoreBar label="Experience" value={data.experienceScore} />
            <ScoreBar label="Soft Skills" value={data.softSkillsScore} />
          </div>

          <div className="rounded-2xl glass p-6">
            <h3 className="font-display text-lg font-semibold mb-4">
              Skills Breakdown
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Hover or tap a skill to highlight the relevant interview rounds.
            </p>
            <div className="space-y-4">
              <SkillGroup
                title="Matched"
                skills={data.matchedSkills}
                tone="success"
                onHover={setHighlightedSkill}
                highlighted={highlightedSkill}
              />
              <SkillGroup
                title="Partial"
                skills={data.partialSkills}
                tone="warning"
                onHover={setHighlightedSkill}
                highlighted={highlightedSkill}
              />
              <SkillGroup
                title="Gaps"
                skills={data.missingSkills}
                tone="danger"
                onHover={setHighlightedSkill}
                highlighted={highlightedSkill}
              />
            </div>
          </div>
        </motion.div>

        {/* RIGHT — Interview Rounds */}
        <motion.div variants={item} className="space-y-4">
          <div className="rounded-2xl glass p-6 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-border/40">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold">
                Interview Rounds
              </h3>
              <p className="text-xs text-muted-foreground">
                {data.interviewRounds.length} stages · click to expand
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-5 top-2 bottom-2 w-px bg-gradient-to-b from-violet-500 via-cyan-500 to-violet-500/30" />
            <div className="space-y-4">
              {data.interviewRounds.map((r, i) => {
                const isHighlighted = highlightedRounds.has(i)
                const status =
                  data.overallScore >= 80
                    ? "ready"
                    : data.overallScore >= 60
                      ? "partial"
                      : "gap"
                const dot =
                  status === "ready"
                    ? "bg-emerald-400"
                    : status === "partial"
                      ? "bg-amber-400"
                      : "bg-rose-400"
                return (
                  <RoundCard
                    key={i}
                    index={i}
                    round={r}
                    isHighlighted={isHighlighted}
                    dot={dot}
                  />
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 75
      ? "from-emerald-500 to-emerald-400"
      : value >= 50
        ? "from-amber-500 to-amber-400"
        : "from-rose-500 to-rose-400"
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-display font-semibold">{value}%</span>
      </div>
      <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  )
}

function SkillGroup({
  title,
  skills,
  tone,
  onHover,
  highlighted,
}: {
  title: string
  skills: string[]
  tone: "success" | "danger" | "warning"
  onHover: (s: string | null) => void
  highlighted: string | null
}) {
  const map = {
    success: {
      Icon: Check,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      glow: "shadow-[0_0_18px_rgba(16,185,129,0.35)]",
    },
    danger: {
      Icon: X,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      glow: "shadow-[0_0_18px_rgba(244,63,94,0.35)]",
    },
    warning: {
      Icon: CircleAlert,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      glow: "shadow-[0_0_18px_rgba(245,158,11,0.35)]",
    },
  }[tone]
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <span
          className={`rounded-full ${map.bg} ${map.color} text-xs font-semibold px-2 py-0.5`}
        >
          {skills.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.length === 0 && (
          <p className="text-xs text-muted-foreground">— None —</p>
        )}
        {skills.map((s, i) => {
          const isOn = highlighted === s
          return (
            <button
              key={i}
              onMouseEnter={() => onHover(s)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onHover(highlighted === s ? null : s)}
              className={`inline-flex items-center gap-1.5 rounded-full ${map.bg} ${map.color} border ${map.border} px-3 py-1 text-xs font-medium transition-all ${
                isOn ? `${map.glow} scale-105` : "hover:scale-105"
              }`}
            >
              <map.Icon className="h-3 w-3" />
              {s}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function RoundCard({
  index,
  round,
  isHighlighted,
  dot,
}: {
  index: number
  round: { round: string; type: string; tips: string; keyTopics: string[] }
  isHighlighted: boolean
  dot: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{
        opacity: 1,
        x: 0,
        boxShadow: isHighlighted
          ? "0 0 0 1px rgba(245,158,11,0.6), 0 0 30px rgba(245,158,11,0.35)"
          : "0 0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="relative pl-12 md:pl-14 rounded-2xl"
    >
      <div className="absolute left-0 md:left-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 font-display font-bold text-sm shadow-[0_0_20px_rgba(124,58,237,0.45)]">
        {index + 1}
      </div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left rounded-2xl glass p-5 hover:border-primary/40 transition-colors"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-display text-base font-semibold">{round.round}</h4>
          <Badge
            variant="secondary"
            className="bg-primary/15 text-primary border-primary/30"
          >
            {round.type}
          </Badge>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${dot} animate-pulse`} />
            status
          </span>
        </div>
        <motion.div
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            {round.tips}
          </p>
          {round.keyTopics?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {round.keyTopics.map((t, j) => (
                <span
                  key={j}
                  className="rounded-full bg-muted/40 border border-border/60 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </motion.div>
        {!open && (
          <p className="text-xs text-muted-foreground mt-2">
            Tap to view tips & key topics
          </p>
        )}
      </button>
    </motion.div>
  )
}
