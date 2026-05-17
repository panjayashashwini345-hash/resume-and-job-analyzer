import OpenAI from "openai"
import type { AnalysisData } from "./store"

const ANALYSIS_SYSTEM_PROMPT = `You are a world-class career coach and technical recruiter. You analyze resumes against job descriptions with surgical precision and produce comprehensive, actionable feedback.

You MUST respond with a single JSON object that strictly conforms to this TypeScript interface:

{
  "jobTitle": string,
  "company": string,
  "candidateName": string,
  "overallScore": number,           // 0-100
  "technicalScore": number,         // 0-100
  "experienceScore": number,        // 0-100
  "softSkillsScore": number,        // 0-100
  "matchedSkills": string[],        // 6-15 items
  "missingSkills": string[],        // 4-12 items
  "partialSkills": string[],        // 2-8 items
  "resumeIssues": [{ "priority": "HIGH"|"MED"|"LOW", "title": string, "description": string }], // 3-6 items
  "interviewRounds": [{ "round": string, "type": string, "tips": string, "keyTopics": string[] }], // 3-5 items
  "quiz": [{ "question": string, "options": [string,string,string,string], "answer": 0|1|2|3, "explanation": string }], // EXACTLY 8 items
  "chatQuestions": string[],        // EXACTLY 8 interview questions
  "improvements": [{ "priority": "HIGH"|"MED"|"LOW", "title": string, "description": string }], // 5-10 items
  "prepPlan": [{ "week": number, "focus": string, "tasks": string[] }], // 3-8 items
  "totalPrepWeeks": number,
  "verdict": "Strong Fit"|"Good Fit"|"Partial Fit"|"Needs Work",
  "verdictReason": string,
  "summary": string                 // 2-3 sentence executive summary
}

Rules:
- Be honest and specific, not generic.
- Quiz questions must directly test the technical skills in the job description.
- Each quiz question must have exactly 4 options and one correct answer index (0-3).
- chatQuestions should mix technical, behavioral, and situational.
- prepPlan tasks must be concrete and actionable.
- If you cannot infer candidateName from the resume, use "Candidate".
- Verdict mapping: 85+ = Strong Fit, 70-84 = Good Fit, 50-69 = Partial Fit, <50 = Needs Work.`

export async function runAnalysis({
  apiKey,
  resumeText,
  jobText,
  onStep,
}: {
  apiKey: string
  resumeText: string
  jobText: string
  onStep?: (n: number) => void
}): Promise<AnalysisData> {
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

  onStep?.(2)

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    temperature: 0.4,
    messages: [
      { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
      {
        role: "user",
        content: `RESUME:\n"""\n${resumeText.slice(0, 16000)}\n"""\n\nJOB DESCRIPTION:\n"""\n${jobText.slice(0, 12000)}\n"""\n\nProduce the JSON now.`,
      },
    ],
  })

  onStep?.(5)

  const raw = completion.choices[0]?.message?.content || "{}"
  const data = JSON.parse(raw) as AnalysisData

  // Defensive defaults
  data.matchedSkills = data.matchedSkills || []
  data.missingSkills = data.missingSkills || []
  data.partialSkills = data.partialSkills || []
  data.resumeIssues = data.resumeIssues || []
  data.interviewRounds = data.interviewRounds || []
  data.quiz = (data.quiz || []).slice(0, 8)
  data.chatQuestions = (data.chatQuestions || []).slice(0, 8)
  data.improvements = data.improvements || []
  data.prepPlan = data.prepPlan || []
  data.totalPrepWeeks = data.totalPrepWeeks || data.prepPlan.length || 4
  data.candidateName = data.candidateName || "Candidate"
  data.company = data.company || "Company"
  data.jobTitle = data.jobTitle || "Role"

  return data
}

export async function streamInterviewReply({
  apiKey,
  jobTitle,
  history,
  nextQuestion,
  onDelta,
}: {
  apiKey: string
  jobTitle: string
  history: { role: "user" | "assistant"; content: string }[]
  nextQuestion: string | null
  onDelta: (chunk: string) => void
}): Promise<string> {
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

  const sys = `You are a senior technical interviewer for the role of "${jobTitle}". Give the candidate brief (2-3 sentence) constructive feedback on their last answer, then ${
    nextQuestion
      ? `ask exactly this next question:\n\n"${nextQuestion}"`
      : "wrap up the interview with a short, encouraging closing message and overall observations."
  }\n\nBe warm but professional. Do not number questions.`

  const stream = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.7,
    stream: true,
    messages: [
      { role: "system", content: sys },
      ...history,
    ],
  })

  let full = ""
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || ""
    if (delta) {
      full += delta
      onDelta(delta)
    }
  }
  return full
}
