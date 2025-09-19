import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import HistoryClient from "@/components/dashboard/history-client"

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const userId = data?.user?.id

  let rows: any[] = []
  if (userId) {
    const { data: preds } = await supabase
      .from("predictions")
      .select("id, predicted_disease, confidence_score, created_at, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200)
    rows = preds || []
  }

  return (
    <div className="min-h-screen bg-plant-gradient">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="rounded-2xl bg-card border border-border shadow-plant p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">History</h1>
            <p className="text-sm text-foreground/70">Recent analyses</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
          </Link>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-plant p-6">
          <HistoryClient serverRows={rows as any} />
        </div>
      </div>
    </div>
  )
}


