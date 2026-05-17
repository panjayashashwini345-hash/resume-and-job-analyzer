import { NextResponse } from "next/server"
import OpenAI from "openai"

export const runtime = "nodejs"
export const maxDuration = 60

const ANALYSIS_SYSTEM_PROMPT = `You are a world-class career coach and technical recruiter. You analyze resumes against job descriptions with surgical precision and produce comprehensive, actionable feedback.

You MUST respond with a single JSON object that strictly conforms to this TypeScript interface:

{
  "jobTitle": string,
  "company": string,
  "candidateName": string,
  "overallScore": number,
  "technicalScore": number,
  "experienceScore": number,
  "softSkillsScore": number,
  "matchedSkills": string[],
  "missingSkills": string[],
  "partialSkills": string[],
  "resumeIssues": [{ "priority": "HIGH"|"MED"|"LOW", "title": string, "description": string }],
  "interviewRounds": [{ "round": string, "type": string, "tips": string, "keyTopics": string[] }],
  "quiz": [{ "question": string, "options": [string,string,string,string], "answer": 0|1|2|3, "explanation": string }],
  "chatQuestions": string[],
  "improvements": [{ "priority": "HIGH"|"MED"|"LOW", "title": string, "description": string }],
  "prepPlan": [{ "week": number, "focus": string, "tasks": string[] }],
  "totalPrepWeeks": number,
  "verdict": "Strong Fit"|"Good Fit"|"Partial Fit"|"Needs Work",
  "verdictReason": string,
  "summary": string
}

Rules:
- Be honest and specific, not generic.
- Quiz must contain EXACTLY 8 questions; each with exactly 4 options and one correct index (0-3).
- chatQuestions must contain EXACTLY 8 questions mixing technical, behavioral, situational.
- prepPlan tasks must be concrete and actionable.
- If candidateName cannot be inferred, use "Candidate".
- Verdict mapping: 85+ = Strong Fit, 70-84 = Good Fit, 50-69 = Partial Fit, <50 = Needs Work.`

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server." },
        { status: 500 },
      )
    }
    const { resumeText, jobText } = await req.json()
    if (!resumeText || !jobText) {
      return NextResponse.json(
        { error: "resumeText and jobText are required." },
        { status: 400 },
      )
    }
    const client = new OpenAI({ apiKey })
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      temperature: 0.4,
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        {
          role: "user",
          content: `RESUME:\n"""\n${String(resumeText).slice(0, 16000)}\n"""\n\nJOB DESCRIPTION:\n"""\n${String(jobText).slice(0, 12000)}\n"""\n\nProduce the JSON now.`,
        },
      ],
    })
    const raw = completion.choices[0]?.message?.content || "{}"
    const data = JSON.parse(raw)
    return NextResponse.json(data)
  } catch (e: any) {
    console.error("[v0] /api/analyze error", e)
    return NextResponse.json(
      { error: e?.message || "Analysis failed" },
      { status: 500 },
    )
  }
}
