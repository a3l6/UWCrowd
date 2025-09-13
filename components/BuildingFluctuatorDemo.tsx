"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Building } from "lucide-react"
import { useBuildingFluctuator } from "@/hooks/use-building-fluctuator"

export function BuildingFluctuatorDemo() {
  const { buildingData, rawPercentages } = useBuildingFluctuator()

  const getOccupancyLevel = (percentage: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    if (percentage >= 90) return { label: "Very High", variant: "destructive" }
    if (percentage >= 70) return { label: "High", variant: "secondary" }
    if (percentage >= 50) return { label: "Medium", variant: "default" }
    if (percentage >= 30) return { label: "Low", variant: "outline" }
    return { label: "Very Low", variant: "outline" }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Building className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Live Building Occupancy</h2>
        <Badge variant="outline" className="ml-2">Updates every second</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(buildingData).map(([buildingName, data]) => {
          const occupancyLevel = getOccupancyLevel(data.percent_full)
          
          return (
            <Card key={buildingName} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>{buildingName}</span>
                  <Badge variant={occupancyLevel.variant}>
                    {occupancyLevel.label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Current</span>
                  </div>
                  <span className="text-2xl font-bold">{data.people}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-medium">{data.percent_full}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-1000 ease-in-out"
                      style={{ width: `${Math.min(100, data.percent_full)}%` }}
                    />
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Raw: {rawPercentages[buildingName]}%</span>
                    <span>Fluctuated: {data.percent_full}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Update Frequency:</span>
            <span>Every 1 second</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Noise Factor:</span>
            <span>5% of base occupancy</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Buildings Tracked:</span>
            <span>{Object.keys(buildingData).length}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}