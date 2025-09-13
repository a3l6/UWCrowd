"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, RefreshCw } from "lucide-react"

export default function TestAIPage() {
  const [aiData, setAiData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testAI = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai-analysis', { method: 'POST' })
      const data = await response.json()
      
      if (data.success) {
        setAiData(data)
      } else {
        setError('Failed to get AI analysis')
      }
    } catch (err) {
      setError(`Error: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          AI Analysis Test
        </h1>
        <p className="text-muted-foreground">Test the Cohere AI integration</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test AI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testAI} 
            disabled={isLoading}
            className="mb-4"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Analyzing..." : "Run AI Analysis"}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {aiData && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm font-semibold">
                  ✅ AI Analysis successful! Generated {aiData.data?.length || 0} building analyses.
                </p>
              </div>

              <div className="space-y-2">
                {aiData.data?.map((analysis: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">
                        {analysis.buildingName} ({analysis.shortName})
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <strong>Busy Level:</strong> {analysis.busyLevel}%
                        </div>
                        <div>
                          <strong>Status:</strong> {analysis.status}
                        </div>
                        <div>
                          <strong>People Count:</strong> {analysis.metrics.peopleCount}
                        </div>
                        <div>
                          <strong>Predicted Business:</strong> {analysis.metrics.predictedBusiness}
                        </div>
                        <div className="col-span-2">
                          <strong>Compared to Yesterday:</strong> {analysis.metrics.comparedToYesterday}
                        </div>
                        <div className="col-span-2">
                          <strong>Next Hour:</strong> {analysis.metrics.nextHourPrediction}
                        </div>
                        <div className="col-span-2">
                          <strong>Best Time:</strong> {analysis.metrics.bestTimeToGo}
                        </div>
                        <div className="col-span-2">
                          <strong>Worst Time:</strong> {analysis.metrics.worstTimeToGo}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  View Raw JSON Response
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded-md text-xs overflow-auto">
                  {JSON.stringify(aiData, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}