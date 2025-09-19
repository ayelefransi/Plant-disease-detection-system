"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface AvatarUploaderProps {
  userId: string
  currentUrl?: string
}

export default function AvatarUploader({ userId, currentUrl }: AvatarUploaderProps) {
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentUrl)
  const [isUploading, setIsUploading] = useState(false)

  const pick = () => inputRef.current?.click()

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png"
      const path = `${userId}/${Date.now()}.${ext}`
      // Ensure bucket exists and is public in your Supabase project
      const { data: upload, error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type })
      if (error) throw error
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(upload.path)
      const publicUrl = pub.publicUrl
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
      setPreviewUrl(publicUrl)
    } catch (err) {
      console.warn("Avatar upload failed", err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border bg-card">
        {previewUrl ? (
          <Image src={previewUrl} alt="Avatar" fill className="object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-sm text-foreground/60">No Photo</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        <Button onClick={pick} disabled={isUploading} className="bg-primary hover:bg-primary/90">
          {isUploading ? "Uploading…" : "Upload"}
        </Button>
        {previewUrl && (
          <a href={previewUrl} target="_blank" className="text-sm text-primary underline">View</a>
        )}
      </div>
    </div>
  )
}


