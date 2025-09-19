import { createClient } from "@/lib/supabase/server"
import InsightsClient from "./visuals"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  const userId = data?.user?.id

  let rows: any[] = []
  if (userId) {
    const { data: preds } = await supabase
      .from("predictions")
      .select("predicted_disease, confidence_score, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200)
    rows = preds || []
  }

  // Derived quick stats for the header strip
  const total = rows.length
  const unique = new Set(rows.map((r: any) => r.predicted_disease)).size
  const avgConfidence = rows.length
    ? Math.round((rows.reduce((s: number, r: any) => s + (Number(r.confidence_score) || 0), 0) / rows.length) * 100)
    : 0
  const highConfidence = rows.filter((r: any) => (Number(r.confidence_score) || 0) > 0.9).length

  return (
    <div className="min-h-screen bg-plant-gradient">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Minimal top bar */}
        <div className="rounded-2xl bg-card/80 backdrop-blur-md border border-border shadow-plant p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Insights</h1>
            <p className="text-sm text-muted-foreground">Advanced visual analytics for your plant detections</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
            </Link>
            <Button className="gap-2 bg-primary hover:bg-primary/90"><Download className="w-4 h-4" /> Export</Button>
          </div>
        </div>

        {/* Visual analytics only */}
        <div className="rounded-2xl overflow-hidden">
          <InsightsClient serverData={rows} />
        </div>
      </div>
    </div>
  )
}


