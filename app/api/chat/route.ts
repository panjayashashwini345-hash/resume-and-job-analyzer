import OpenAI from "openai"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not configured on the server." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }
    const { jobTitle, history, nextQuestion } = await req.json()

    const sys = `You are a senior technical interviewer for the role of "${jobTitle}". Give the candidate brief (2-3 sentence) constructive feedback on their last answer, then ${
      nextQuestion
        ? `ask exactly this next question:\n\n"${nextQuestion}"`
        : "wrap up the interview with a short, encouraging closing message and overall observations."
    }\n\nBe warm but professional. Do not number questions.`

    const client = new OpenAI({ apiKey })
    const stream = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      stream: true,
      messages: [{ role: "system", content: sys }, ...(history || [])],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || ""
            if (delta) controller.enqueue(encoder.encode(delta))
          }
        } catch (err) {
          console.error("[v0] chat stream error", err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    })
  } catch (e: any) {
    console.error("[v0] /api/chat error", e)
    return new Response(
      JSON.stringify({ error: e?.message || "Chat failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
