import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, locale } = body as { messages: any[]; locale?: string }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set")
      return NextResponse.json({ error: "Missing GEMINI_API_KEY (set in .env.local)" }, { status: 500 })
    }

    const system = locale === "am"
      ? "እርስዎ የተክል በሽታ መለያየት እና ህክምና መመሪያ አጋር ነዎት። መረጃዎችን በአማርኛ ይስጡ፣ ህክምና እቅድ፣ መከላከያ ምክሮች እና መረጃ ይሁኑ። በፕሮጀክቱ ገደብ ውስጥ ብቻ ይመልሱ።"
      : "You are a plant disease assistant for this app. Provide concise treatment plans, prevention tips, and factual info strictly about plant diseases and care. Keep answers scoped to tomatoes, potatoes, and peppers unless asked generally."

    // Map OpenAI-style messages to Gemini's contents
    const contents = (messages || []).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }],
    }))

    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { role: "system", parts: [{ text: system }] },
        generationConfig: { temperature: 0.4 },
      }),
    })

    if (!resp.ok) {
      const err = await resp.text()
      console.error("OpenAI error:", err)
      return NextResponse.json({ error: err }, { status: 500 })
    }

    const data = await resp.json()
    const reply = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("") || ""
    return NextResponse.json({ reply })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}


