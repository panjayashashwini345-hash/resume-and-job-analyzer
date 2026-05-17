"use client"

import { useAppStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { runAnalysis } from "@/lib/openai-client"

export function AnalyzeButton() {
  const {
    resumeText,
    jobText,
    apiKey,
    uiState,
    setUIState,
    setLoadingStep,
    setAnalysisData,
  } = useAppStore()

  const missing: string[] = []
  if (!resumeText.trim()) missing.push("resume")
  if (!jobText.trim()) missing.push("job description")
  if (!apiKey.trim()) missing.push("API key")
  const disabled = missing.length > 0 || uiState === "loading"

  async function analyze() {
    if (disabled) {
      toast.error(`Missing: ${missing.join(", ")}`)
      return
    }
    setUIState("loading")
    setLoadingStep(0)
    // Visual progress steps for the loading overlay
    const stepTimers = [
      setTimeout(() => setLoadingStep(1), 500),
      setTimeout(() => setLoadingStep(2), 1500),
    ]
    try {
      const data = await runAnalysis({
        apiKey,
        resumeText,
        jobText,
        onStep: (n) => setLoadingStep(n),
      })
      setLoadingStep(5)
      await new Promise((r) => setTimeout(r, 600))
      setAnalysisData(data)
      setUIState("results")
      toast.success("Analysis complete")
    } catch (e: any) {
      console.error("[v0] analyze error", e)
      toast.error(e?.message || "Analysis failed. Check your API key.")
      setUIState("input")
    } finally {
      stepTimers.forEach(clearTimeout)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={analyze}
        disabled={disabled}
        size="lg"
        className="w-full h-14 text-base font-semibold relative overflow-hidden bg-gradient-to-r from-indigo-500 via-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed pulse-glow"
      >
        {uiState === "loading" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Analyzing…
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" /> Analyze My Fit
          </>
        )}
      </Button>
      {missing.length > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          Add your {missing.join(", ")} to enable analysis.
        </p>
      )}
    </div>
  )
}
