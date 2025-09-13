import { WaterlooHeatMap } from "@/components/UWHeatMap"

export default function HeatmapPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">University of Waterloo Building Occupancy</h1>
          <p className="text-muted-foreground">
            Real-time heat map showing current occupancy levels across campus buildings
          </p>
        </div>
        <WaterlooHeatMap />
      </div>
    </main>
  )
}
