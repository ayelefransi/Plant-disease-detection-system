"use   client"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Leaf } from "lucide-react"
import Link from "next/link"

interface Prediction {
  id: string
  plant_type: string
  predicted_disease: string
  confidence_score: number
  created_at: string
  status: string
}

interface RecentPredictionsProps {
  predictions: Prediction[]
}

export function RecentPredictions({ predictions }: RecentPredictionsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Analysis
        </CardTitle>
        <CardDescription>Your latest plant disease detection results</CardDescription>
      </CardHeader>
      <CardContent>
        {predictions.length === 0 ? (
          <div className="text-center py-8">
            <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No analyses yet</p>
            <p className="text-sm text-muted-foreground">Upload your first plant image to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{prediction.predicted_disease}</h4>
                    <Badge variant="secondary" className={getConfidenceColor(prediction.confidence_score)}>
                      {(prediction.confidence_score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {prediction.plant_type} • {formatDate(prediction.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={prediction.status === "completed" ? "default" : "secondary"} className="capitalize">
                    {prediction.status}
                  </Badge>
                </div>
              </div>
            ))}

            {predictions.length >= 5 && (
              <div className="text-center pt-4">
                <Link href="/dashboard/history" className="text-primary hover:text-primary/80 text-sm font-medium">
                  View all analyses →
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
