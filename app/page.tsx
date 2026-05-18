"use client"

import { useAppStore } from "@/lib/store"
import { Hero } from "@/components/hero"
import { InputPanel } from "@/components/input-panel"
import { ResultsPanel } from "@/components/results-panel"
import { LoadingOverlay } from "@/components/loading-overlay"
import { AskAce } from "@/components/ask-ace"

export default function Page() {
  const uiState = useAppStore((s) => s.uiState)
  return (
    <main className="relative min-h-screen">
      {uiState !== "results" && (
        <>
          <Hero />
          <InputPanel />
        </>
      )}
      {uiState === "results" && <ResultsPanel />}
      <LoadingOverlay />
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        Ace Prep AI — Crack every interview. Powered by AI.
      </footer>
      <AskAce />
    </main>
  )
}
