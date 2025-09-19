"use client"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, TrendingUp, Shield, Clock } from "lucide-react"

interface StatsCardsProps {
  totalPredictions: number
  uniqueDiseases?: number
  averageConfidence?: number
  averageProcessingTime?: number
}

export function StatsCards({ 
  totalPredictions, 
  uniqueDiseases = 12, 
  averageConfidence = 95.2, 
  averageProcessingTime = 2.3 
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPredictions}</div>
          <p className="text-xs text-muted-foreground">Plant images analyzed</p>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageConfidence}%</div>
          <p className="text-xs text-muted-foreground">AI model accuracy</p>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Diseases Detected</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueDiseases}+</div>
          <p className="text-xs text-muted-foreground">Different plant diseases</p>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Processing</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageProcessingTime}s</div>
          <p className="text-xs text-muted-foreground">Analysis time</p>
        </CardContent>
      </Card>
    </div>
  )
}
