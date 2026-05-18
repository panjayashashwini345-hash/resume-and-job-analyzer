import Anthropic from "@anthropic-ai/sdk"

export const runtime = "nodejs"
export const maxDuration = 60

const SYSTEM_PROMPT =
  "You are Ace, an expert AI interview coach embedded in Ace Prep AI. Help users prepare for job interviews with specific, actionable, encouraging advice. Be concise and practical. When relevant, reference the context of resume analysis and job fit."

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as {
      messages: { role: "user" | "assistant"; content: string }[]
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "No messages" }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return Response.json(
        {
          error:
            "ANTHROPIC_API_KEY is not configured on the server. Add it in Project Settings → Environment Variables.",
        },
        { status: 500 },
      )
    }

    const client = new Anthropic({ apiKey })

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (err: any) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    })
  } catch (e: any) {
    return Response.json(
      { error: e?.message || "Chat failed" },
      { status: 500 },
    )
  }
}
