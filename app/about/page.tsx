import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, BarChart3 } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">About UW Crowd</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
Making Student Life Smarter with Real-Time Campus Location Tracking          </p>
        </div>

        {/* Team Image */}
        <div className="mb-12">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <img
                src="/professional-diverse-team-working-together-in-mode.jpg"
                alt="LocationHub team working together"
                className="w-full h-64 md:h-80 object-cover"
              />
            </CardContent>
          </Card>
        </div>

        {/* Mission Statement */}
        <div className="mb-12">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed text-pretty">
               Our project aims to revolutionize how students navigate campus. By leveraging ESP32 devices to detect Bluetooth signals from mobile devices, we provide real-time occupancy data for libraries, study spaces, cafeterias, and more. Students can quickly see which locations are crowded or free, optimizing their daily routines and study sessions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Real-Time Updates
</h3>
              <p className="text-sm text-muted-foreground text-pretty">
Stay informed with live data showing how busy campus locations are in real time.              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI-Powered Analytics

</h3>
              <p className="text-sm text-muted-foreground text-pretty">
Our AI summarizes real-time and historical location data, highlighting trends and peak hours to give students actionable insights for planning their day.    </p>        </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Smart Insights</h3>
              <p className="text-sm text-muted-foreground text-pretty">
Get actionable information about which locations are busiest at different times, helping students plan their day more efficiently.              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technology Stack */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground leading-relaxed text-pretty mb-4">
             Our system uses ESP32 devices deployed around campus to detect nearby Bluetooth devices. Data is collected and processed in real time, allowing our platform to provide instant insights into occupancy levels and peak hours.
            </p>
            <p className="text-muted-foreground leading-relaxed text-pretty">
              The platform features a clean dashboard that visualizes location occupancy, with live updates and easy-to-read metrics. Whether a student is looking for a quiet study spot or a place to grab a bite, our platform helps them make informed decisions quickly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
