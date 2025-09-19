"use client"

import { useEffect, useMemo, useState } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentPredictions } from "@/components/dashboard/recent-predictions"

type ServerPrediction = {
  id: string
  plant_type: string
  predicted_disease: string
  confidence_score: number
  created_at: string
  status: string
}

interface DashboardClientProps {
  serverPredictions: ServerPrediction[]
  serverTotal: number
  serverUniqueDiseases: number
  serverAverageConfidence: number
}

export default function DashboardClient({
  serverPredictions,
  serverTotal,
  serverUniqueDiseases,
  serverAverageConfidence,
}: DashboardClientProps) {
  const [clientPredictions, setClientPredictions] = useState<ServerPrediction[] | null>(null)

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("predictions") : null
      if (raw) {
        const parsed = JSON.parse(raw) as ServerPrediction[]
        setClientPredictions(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  const merged = useMemo(() => {
    const base = Array.isArray(serverPredictions) ? serverPredictions : []
    const local = Array.isArray(clientPredictions) ? clientPredictions : []
    // De-duplicate by id+created_at to avoid double counting
    const seen = new Set<string>()
    const result: ServerPrediction[] = []
    const pushUnique = (arr: ServerPrediction[]) => {
      arr.forEach((p) => {
        const key = `${p.id}-${p.created_at}`
        if (!seen.has(key)) {
          seen.add(key)
          result.push(p)
        }
      })
    }
    // Prefer server, then fill with client items that are not present
    pushUnique(base)
    pushUnique(local)
    return result
  }, [serverPredictions, clientPredictions])

  const stats = useMemo(() => {
    if (merged.length === 0) {
      return {
        total: serverTotal,
        unique: serverUniqueDiseases,
        avgConfidence: serverAverageConfidence,
      }
    }

    const total = merged.length
    const unique = new Set(merged.map((p) => p.predicted_disease)).size
    const avgConfidence =
      merged.reduce((sum, p) => sum + (Number(p.confidence_score) || 0), 0) / total * 100

    return {
      total,
      unique,
      avgConfidence: parseFloat(avgConfidence.toFixed(1)),
    }
  }, [merged, serverTotal, serverUniqueDiseases, serverAverageConfidence])

  return (
    <>
      <StatsCards
        totalPredictions={stats.total}
        uniqueDiseases={stats.unique}
        averageConfidence={stats.avgConfidence}
        averageProcessingTime={2.3}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* UploadSection is rendered server-side outside this component */}
        <RecentPredictions predictions={merged.slice(0, 5)} />
      </div>
    </>
  )
}


