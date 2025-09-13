import { WaterlooHeatMap } from "@/components/UWHeatMap"

export default function HeatmapPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="mt-8 mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">
          <span style={{ color: '#FCA311' }}>UW </span>
          <span style={{ color: '#14213D' }}>Building Occupancy</span>
            </h1>
          <p className="text-muted-foreground">
            Real-time heat map showing current occupancy levels across campus buildings
          </p>
        </div>
        <WaterlooHeatMap />
      </div>
    </main>
  )
}
