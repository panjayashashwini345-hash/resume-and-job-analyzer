import type { AnalysisData } from "./store"

export async function runAnalysis({
  resumeText,
  jobText,
  onStep,
}: {
  resumeText: string
  jobText: string
  onStep?: (n: number) => void
}): Promise<AnalysisData> {
  onStep?.(2)

  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jobText }),
  })

  onStep?.(5)

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data?.error || "Analysis failed")
  }

  // Defensive defaults
  const d = data as AnalysisData
  d.matchedSkills = d.matchedSkills || []
  d.missingSkills = d.missingSkills || []
  d.partialSkills = d.partialSkills || []
  d.resumeIssues = d.resumeIssues || []
  d.interviewRounds = d.interviewRounds || []
  d.quiz = (d.quiz || []).slice(0, 8)
  d.chatQuestions = (d.chatQuestions || []).slice(0, 8)
  d.improvements = d.improvements || []
  d.prepPlan = d.prepPlan || []
  d.totalPrepWeeks = d.totalPrepWeeks || d.prepPlan.length || 4
  d.candidateName = d.candidateName || "Candidate"
  d.company = d.company || "Company"
  d.jobTitle = d.jobTitle || "Role"
  return d
}

export async function streamInterviewReply({
  jobTitle,
  history,
  nextQuestion,
  onDelta,
}: {
  jobTitle: string
  history: { role: "user" | "assistant"; content: string }[]
  nextQuestion: string | null
  onDelta: (chunk: string) => void
}): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobTitle, history, nextQuestion }),
  })

  if (!res.ok || !res.body) {
    let msg = "Chat failed"
    try {
      const j = await res.json()
      msg = j?.error || msg
    } catch {}
    throw new Error(msg)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ""
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    if (chunk) {
      full += chunk
      onDelta(chunk)
    }
  }
  return full
}
