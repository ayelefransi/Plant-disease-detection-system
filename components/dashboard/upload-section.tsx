"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Leaf,
  History,
  RotateCcw,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function UploadSection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [plantType, setPlantType] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [prediction, setPrediction] = useState<any>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Store latest prediction in localStorage
  useEffect(() => {
    if (!prediction) return
    try {
      const existing = typeof window !== "undefined" ? window.localStorage.getItem("predictions") : null
      const list = existing ? JSON.parse(existing) : []
      const entry = {
        id: prediction.id || `temp-${Date.now()}`,
        plant_type: prediction.plant_type,
        predicted_disease: prediction.predicted_disease,
        confidence_score: prediction.confidence_score,
        created_at: prediction.created_at || new Date().toISOString(),
        status: prediction.status || "completed",
      }
      const alreadyExists = Array.isArray(list) && list.some((p: any) => p.id === entry.id && p.created_at === entry.created_at)
      const next = alreadyExists ? list : [entry, ...list]
      window.localStorage.setItem("predictions", JSON.stringify(next.slice(0, 20)))
    } catch {}
  }, [prediction])

  // Handle image drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file)
      setPrediction(null)

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: false,
  })

  const handleUpload = async () => {
    if (!selectedFile || !plantType) return
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Quick client-side validation: ensure the image looks like a leaf (green-dominant)
      const looksLikeLeaf = await (async () => {
        try {
          const src = imagePreview
          if (!src) return true
          const img = new Image()
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = reject
            img.src = src
          })
          const canvas = document.createElement("canvas")
          const size = 64
          canvas.width = size
          canvas.height = size
          const ctx = canvas.getContext("2d")
          if (!ctx) return true
          ctx.drawImage(img, 0, 0, size, size)
          const { data } = ctx.getImageData(0, 0, size, size)
          let greenish = 0
          let total = 0
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const a = data[i + 3]
            if (a < 10) continue
            total++
            // green dominance with margin and avoid near-gray
            const max = Math.max(r, g, b)
            const min = Math.min(r, g, b)
            const saturation = max === 0 ? 0 : (max - min) / max
            if (g > r + 12 && g > b + 12 && saturation > 0.15) greenish++
          }
          const ratio = total ? greenish / total : 0
          return ratio >= 0.2 // at least 20% green-dominant pixels
        } catch {
          return true
        }
      })()

      if (!looksLikeLeaf) {
        alert("Please try uploading a leaf image.")
        return
      }

      const formData = new FormData()
      formData.append("image", selectedFile)
      formData.append("plantType", plantType)

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 8
        })
      }, 200)

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Analysis failed")
      }

      const data = await response.json()
      if (data.analysis?.rejectReason === "not_leaf") {
        alert("Please try uploading a leaf image.")
        return
      }
      setPrediction({
        ...data.prediction,
        image_url: imagePreview,
        predicted_disease: data.analysis.disease,
        confidence_score: data.analysis.confidence,
        plant_type: data.analysis.plantType,
      })
    } catch {
      alert(`Analysis failed. Please try again.`)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setPlantType("")
    setPrediction(null)
    setImagePreview(null)
    setUploadProgress(0)
  }

  return (
    <AnimatePresence mode="wait">
      {prediction ? (
        <motion.div
          key="results"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/70 border border-zinc-200/30 dark:border-zinc-800/50 shadow-xl rounded-3xl p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Analysis Complete
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Results for your <span className="font-medium capitalize">{prediction.plant_type}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.img
                  src={prediction.image_url || "/placeholder.svg"}
                  alt="Plant leaf"
                  className="w-full h-40 sm:h-48 rounded-2xl border shadow-md object-cover"
                  whileHover={{ scale: 1.05 }}
                />
                <div className="flex flex-col justify-center">
                  <h3 className="text-lg font-semibold">{prediction.predicted_disease}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(prediction.confidence_score * 100).toFixed(1)}% confidence
                  </p>
                  <Progress value={prediction.confidence_score * 100} className="mt-4 h-2 rounded-full" />
                </div>
              </div>

              {prediction.predicted_disease !== "Healthy" && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">Disease Detected</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Please check the treatment recommendations in the database.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button onClick={resetUpload} variant="outline" className="rounded-xl flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Analyze Another
                </Button>
                <Button onClick={() => router.push("/dashboard/history")} className="rounded-xl flex items-center gap-2">
                  <History className="w-4 h-4" />
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="upload"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-zinc-900/70 border border-zinc-200/30 dark:border-zinc-800/50 shadow-xl rounded-3xl p-8">
            <CardHeader className="pb-6 text-center space-y-2">
              <Leaf className="w-10 h-10 mx-auto text-green-600" />
              <CardTitle className="text-2xl font-bold">Plant Disease Detector</CardTitle>
              <CardDescription className="text-muted-foreground">
                Upload a clear image of your plant leaf to detect possible diseases.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drag & Drop Upload */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                  isDragActive
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-muted-foreground/30 hover:border-green-400 hover:bg-muted/10"
                }`}
              >
                <input {...getInputProps()} />
                {selectedFile && imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto w-32 h-32 object-cover rounded-xl shadow-md"
                  />
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="font-medium">
                      {isDragActive ? "Drop your image here" : "Drag & drop or click to browse"}
                    </p>
                    <p className="text-sm text-muted-foreground">PNG, JPG, WEBP up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Plant Type Select */}
              <div>
                <label className="text-sm font-medium">Plant Type</label>
                <Select value={plantType} onValueChange={setPlantType}>
                  <SelectTrigger className="mt-1 h-12 rounded-xl">
                    <SelectValue placeholder="Select plant type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tomato"> Tomato</SelectItem>
                    <SelectItem value="potato"> Potato</SelectItem>
                    <SelectItem value="pepper"> Pepper</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </div>
                  <Progress value={uploadProgress} className="h-2 rounded-full" />
                </div>
              )}

              {/* Analyze Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !plantType || isUploading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Analyze Plant
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
