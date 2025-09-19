"use client"

import { useEffect, useRef, useState } from "react"
import { MessageSquare, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type ChatMsg = { role: "user" | "assistant"; content: string }

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [locale, setLocale] = useState<"en" | "am">("en")
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "How can I help with your plant today?" },
  ])
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    setInput("")
    const next = [...messages, { role: "user", content: text }]
    setMessages(next)
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, locale }),
      })
      const data = await res.json()
      setMessages((m) => [...m, { role: "assistant", content: data.reply || "" }])
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, something went wrong." }])
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-plant grid place-items-center">
        <MessageSquare className="w-5 h-5" />
      </button>
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[min(92vw,380px)] rounded-2xl border border-border bg-card shadow-plant">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <div className="text-sm font-semibold">Assistant</div>
            <div className="flex items-center gap-2">
              <select value={locale} onChange={(e) => setLocale(e.target.value as any)} className="text-xs border border-border rounded-md px-2 py-1 bg-card">
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
              </select>
              <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-primary/10">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div ref={listRef} className="max-h-80 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`text-sm ${m.role === "assistant" ? "bg-secondary" : "bg-primary/10"} rounded-lg p-2`}>{m.content}</div>
            ))}
          </div>
          <div className="p-3 border-t border-border flex items-center gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && send()} placeholder={locale==='am' ? "መልዕክት ይጻፉ..." : "Type a message..."} className="flex-1 border border-border rounded-md px-3 py-2 bg-card" />
            <Button onClick={send} className="h-9 px-3 bg-primary hover:bg-primary/90">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}









