import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-plant-gradient">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="rounded-2xl bg-card border border-border shadow-plant p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Help</h1>
            <p className="text-sm text-foreground/70">FAQs and support</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
          </Link>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-plant p-6">
          <p className="text-sm text-foreground/70">Help content placeholder.</p>
        </div>
      </div>
    </div>
  )
}









