"use client"

import { useEffect, useState } from "react"
import { useAppStore, type AnalysisData } from "@/lib/store"
import { motion } from "framer-motion"
import { ScoreRing } from "@/components/score-ring"
import { CountUp } from "@/components/count-up"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  ThumbsUp,
  Meh,
  AlertTriangle,
  FileDown,
  Loader2,
  Check,
  X,
} from "lucide-react"
import { generatePdfReport } from "@/lib/pdf-report"
import { toast } from "sonner"

const VERDICT_META: Record<
  AnalysisData["verdict"],
  { Icon: typeof Trophy; gradient: string; tone: string }
> = {
  "Strong Fit": {
    Icon: Trophy,
    gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    tone: "text-emerald-400",
  },
  "Good Fit": {
    Icon: ThumbsUp,
    gradient: "from-cyan-500/20 via-cyan-500/10 to-transparent",
    tone: "text-cyan-400",
  },
  "Partial Fit": {
    Icon: Meh,
    gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
    tone: "text-amber-400",
  },
  "Needs Work": {
    Icon: AlertTriangle,
    gradient: "from-rose-500/20 via-rose-500/10 to-transparent",
    tone: "text-rose-400",
  },
}

export function SummaryTab() {
  const data = useAppStore((s) => s.analysisData)!
  const [generating, setGenerating] = useState(false)
  const meta = VERDICT_META[data.verdict] || VERDICT_META["Partial Fit"]

  async function downloadPdf() {
    setGenerating(true)
    try {
      await generatePdfReport(data)
      toast.success("PDF downloaded")
    } catch (e: any) {
      toast.error(e?.message || "PDF generation failed")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Verdict banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl border border-border/60 p-7 bg-gradient-to-br ${meta.gradient}`}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl glass-strong">
            <meta.Icon className={`h-8 w-8 ${meta.tone}`} />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Verdict
            </p>
            <h2 className={`font-display text-3xl md:text-4xl font-bold ${meta.tone}`}>
              {data.verdict}
            </h2>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              {data.verdictReason}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Overall Score">
          <ScoreRing
            value={data.overallScore}
            size={120}
            strokeWidth={9}
            label=""
          />
        </StatCard>
        <StatCard label="Skills Matched">
          <CountUp
            value={data.matchedSkills.length}
            className="font-display text-5xl font-bold text-emerald-400"
          />
        </StatCard>
        <StatCard label="Skills Gap">
          <CountUp
            value={data.missingSkills.length}
            className="font-display text-5xl font-bold text-rose-400"
          />
        </StatCard>
        <StatCard label="Prep Weeks">
          <CountUp
            value={data.totalPrepWeeks}
            className="font-display text-5xl font-bold gradient-text"
          />
        </StatCard>
      </div>

      {/* AI Assessment */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl glass p-6 border-l-4 border-l-primary"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
          AI Assessment
        </p>
        <Typewriter text={data.summary} />
      </motion.div>

      {/* Score bars */}
      <div className="rounded-2xl glass p-6">
        <h3 className="font-display font-semibold mb-4">Score Breakdown</h3>
        <div className="space-y-4">
          <ScoreBar label="Technical" value={data.technicalScore} />
          <ScoreBar label="Experience" value={data.experienceScore} />
          <ScoreBar label="Soft Skills" value={data.softSkillsScore} />
          <ScoreBar label="Overall" value={data.overallScore} />
        </div>
      </div>

      {/* Top 3 priority actions */}
      {data.improvements.length > 0 && (
        <div className="rounded-2xl glass p-6">
          <h3 className="font-display font-semibold mb-4">
            Top Priority Actions
          </h3>
          <div className="space-y-3">
            {[...data.improvements]
              .sort((a, b) => {
                const o = { HIGH: 0, MED: 1, LOW: 2 }
                return o[a.priority] - o[b.priority]
              })
              .slice(0, 3)
              .map((imp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4 rounded-xl bg-muted/30 p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-400 font-display font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-display font-semibold">{imp.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {imp.description}
                    </p>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* Skill cloud */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkillCloud
          title="Matched"
          skills={data.matchedSkills}
          tone="success"
        />
        <SkillCloud
          title="Missing"
          skills={data.missingSkills}
          tone="danger"
        />
      </div>

      {/* PDF Download */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center pt-4"
      >
        <Button
          onClick={downloadPdf}
          disabled={generating}
          size="lg"
          className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0 pulse-glow"
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Generating PDF…
            </>
          ) : (
            <>
              <FileDown className="h-5 w-5" /> Download Full PDF Report
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}

function StatCard({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl glass p-5 flex flex-col items-center text-center">
      <div className="flex-1 flex items-center justify-center min-h-[100px]">
        {children}
      </div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
        {label}
      </p>
    </div>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 75 ? "from-emerald-500 to-emerald-400" : value >= 50 ? "from-amber-500 to-amber-400" : "from-rose-500 to-rose-400"
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-display font-semibold">{value}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
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

function SkillCloud({
  title,
  skills,
  tone,
}: {
  title: string
  skills: string[]
  tone: "success" | "danger"
}) {
  const map =
    tone === "success"
      ? {
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          Icon: Check,
        }
      : {
          color: "text-rose-400",
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          Icon: X,
        }
  return (
    <div className="rounded-2xl glass p-5">
      <h4 className="font-display font-semibold mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {skills.slice(0, 20).map((s, i) => (
          <span
            key={i}
            className={`inline-flex items-center gap-1 rounded-full ${map.bg} ${map.color} border ${map.border} px-2.5 py-1 text-xs`}
          >
            <map.Icon className="h-3 w-3" />
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

function Typewriter({ text }: { text: string }) {
  const [shown, setShown] = useState("")
  useEffect(() => {
    setShown("")
    let i = 0
    const id = setInterval(() => {
      i += 2
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 18)
    return () => clearInterval(id)
  }, [text])
  return (
    <p className="italic text-foreground/90 leading-relaxed">
      &ldquo;{shown}
      <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
      &rdquo;
    </p>
  )
}
