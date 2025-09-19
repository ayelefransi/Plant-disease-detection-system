import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import AvatarUploader from "@/components/dashboard/avatar-uploader"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  return (
    <div className="min-h-screen bg-plant-gradient">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="rounded-2xl bg-card border border-border shadow-plant p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="text-sm text-foreground/70">Manage your account</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
          </Link>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-plant p-6 space-y-6">
          <div>
            <div className="text-sm text-foreground/70 mb-2">Profile picture</div>
            <AvatarUploader userId={user?.id || "anon"} currentUrl={user?.user_metadata?.avatar_url} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-foreground/70">Name</div>
              <div className="text-lg font-medium">{user?.user_metadata?.full_name ?? "—"}</div>
            </div>
            <div>
              <div className="text-sm text-foreground/70">Email</div>
              <div className="text-lg font-medium">{user?.email}</div>
            </div>
            <div>
              <div className="text-sm text-foreground/70">User ID</div>
              <div className="text-xs break-all">{user?.id}</div>
            </div>
            <div>
              <div className="text-sm text-foreground/70">Created</div>
              <div className="text-lg font-medium">{user?.created_at ? new Date(user.created_at).toLocaleString() : "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


