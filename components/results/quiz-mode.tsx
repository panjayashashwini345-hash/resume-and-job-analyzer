"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react"

export function QuizMode() {
  const data = useAppStore((s) => s.analysisData)!
  const { quizState, setQuizState } = useAppStore()
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)

  const total = data.quiz.length
  const q = data.quiz[quizState.currentQ]

  function selectOption(idx: number) {
    if (revealed) return
    setSelected(idx)
    setRevealed(true)
    const correct = idx === q.answer
    setQuizState({
      ...quizState,
      answers: [...quizState.answers, idx],
      score: quizState.score + (correct ? 1 : 0),
    })
  }

  function next() {
    if (quizState.currentQ + 1 >= total) {
      setQuizState({ ...quizState, done: true })
      return
    }
    setQuizState({ ...quizState, currentQ: quizState.currentQ + 1 })
    setSelected(null)
    setRevealed(false)
  }

  function restart() {
    setQuizState({ currentQ: 0, answers: [], score: 0, done: false })
    setSelected(null)
    setRevealed(false)
  }

  if (quizState.done) {
    const pct = Math.round((quizState.score / total) * 100)
    const grade =
      pct >= 90 ? "A" : pct >= 75 ? "B" : pct >= 60 ? "C" : pct >= 45 ? "D" : "F"
    const summary =
      pct >= 75
        ? "Excellent — you're well-prepared on the technical fundamentals."
        : pct >= 50
          ? "Solid effort — review the missed topics and you'll be ready."
          : "Time to dig in — focus your prep on the missing areas."

    return (
      <>
        {pct > 70 && <Confetti />}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-md rounded-2xl glass-strong p-8 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-display text-2xl font-bold mt-4">Quiz Complete</h3>
          <div className="mt-6 flex items-baseline justify-center gap-2">
            <span className="font-display text-6xl font-bold gradient-text">
              {grade}
            </span>
          </div>
          <p className="mt-2 text-3xl font-display font-semibold">
            {quizState.score} / {total}
          </p>
          <p className="text-muted-foreground">{pct}%</p>
          <p className="mt-4 text-sm text-muted-foreground/90">{summary}</p>
          <Button onClick={restart} className="mt-6" variant="secondary">
            <RotateCcw className="h-4 w-4" /> Retake
          </Button>
        </motion.div>
      </>
    )
  }

  if (!q) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Progress + Score */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Question {quizState.currentQ + 1} of {total}
          </p>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              animate={{
                width: `${((quizState.currentQ + (revealed ? 1 : 0)) / total) * 100}%`,
              }}
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
            />
          </div>
        </div>
        <div className="ml-4 rounded-full glass px-3 py-1.5 text-sm font-medium">
          <span className="text-emerald-400 font-bold">{quizState.score}</span>
          <span className="text-muted-foreground"> / {total} correct</span>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={quizState.currentQ}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl glass-strong p-6 md:p-8"
        >
          <h3 className="font-display text-lg md:text-xl font-semibold leading-snug text-balance">
            {q.question}
          </h3>

          <div className="mt-6 space-y-2.5">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.answer
              const isSelected = i === selected
              const showCorrect = revealed && isCorrect
              const showWrong = revealed && isSelected && !isCorrect
              const fade = revealed && !isCorrect && !isSelected

              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => selectOption(i)}
                  disabled={revealed}
                  className={`w-full text-left rounded-xl border p-4 transition-all flex items-start gap-3 ${
                    showCorrect
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : showWrong
                        ? "border-rose-500/50 bg-rose-500/10"
                        : isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-white/[0.02]"
                  } ${fade ? "opacity-40" : ""}`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                      showCorrect
                        ? "bg-emerald-500 text-white"
                        : showWrong
                          ? "bg-rose-500 text-white"
                          : "bg-muted text-foreground"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 text-sm leading-relaxed">{opt}</span>
                  {showCorrect && (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  )}
                  {showWrong && (
                    <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
                  )}
                </motion.button>
              )
            })}
          </div>

          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                  Explanation
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {q.explanation}
                </p>
                <Button
                  onClick={next}
                  className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0"
                >
                  {quizState.currentQ + 1 >= total ? "Finish" : "Next Question"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Confetti() {
  const colors = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e"]
  const pieces = Array.from({ length: 80 }).map((_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: colors[i % colors.length],
    rotate: Math.random() * 360,
  }))
  return (
    <>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </>
  )
}
