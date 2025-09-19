"use client"

import { useEffect, useMemo, useState } from "react"

type Row = {
  id: string
  predicted_disease: string
  confidence_score: number
  created_at: string
  status?: string
  plant_type?: string
}

export default function HistoryClient({ serverRows = [] as Row[] }: { serverRows?: Row[] }) {
  const [localRows, setLocalRows] = useState<Row[]>([])

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('predictions') : null
      if (raw) setLocalRows(JSON.parse(raw))
    } catch {}
  }, [])

  const merged = useMemo(() => {
    const seen = new Set<string>()
    const out: Row[] = []
    const push = (arr: Row[]) => arr.forEach(r => {
      const key = `${r.id}-${r.created_at}`
      if (!seen.has(key)) { seen.add(key); out.push(r) }
    })
    push(serverRows || [])
    push(localRows || [])
    return out.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [serverRows, localRows])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-foreground/70">
            <th className="py-2">Date</th>
            <th className="py-2">Plant</th>
            <th className="py-2">Disease</th>
            <th className="py-2">Confidence</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {merged.map((r) => (
            <tr key={`${r.id}-${r.created_at}`} className="border-t border-border">
              <td className="py-2">{new Date(r.created_at).toLocaleString()}</td>
              <td className="py-2 capitalize">{r.plant_type || "—"}</td>
              <td className="py-2">{r.predicted_disease}</td>
              <td className="py-2">{Math.round((Number(r.confidence_score) || 0) * 100)}%</td>
              <td className="py-2 capitalize">{r.status ?? "completed"}</td>
            </tr>
          ))}
          {merged.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-foreground/60">No history yet. Upload a leaf image to get started.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}









