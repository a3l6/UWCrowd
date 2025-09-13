import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, TrendingUp, Users, Clock } from "lucide-react"

export default function HeatmapPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-balance">Campus Heatmap</h1>
          <p className="text-muted-foreground text-pretty">
            Real-time visualization of activity levels across all campus locations
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Total Occupancy</span>
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">1,247</div>
              <div className="text-xs text-muted-foreground">+12% from yesterday</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Active Locations</span>
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">6/6</div>
              <div className="text-xs text-muted-foreground">All locations online</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Peak Activity</span>
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">2:30 PM</div>
              <div className="text-xs text-muted-foreground">Daily average</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Avg. Duration</span>
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">2.4h</div>
              <div className="text-xs text-muted-foreground">Per visitor</div>
            </CardContent>
          </Card>
        </div>

        {/* Campus Map Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Campus Activity Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-8 min-h-[400px] flex items-center justify-center border-2 border-dashed border-border">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Campus Map Integration</h3>
                <p className="text-muted-foreground text-pretty max-w-md">
                  Interactive campus map will be displayed here showing real-time activity levels, occupancy data, and
                  traffic patterns across all locations.
                </p>
                <Badge variant="outline" className="mt-4">
                  Map Integration Pending
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">New York Office</div>
                    <div className="text-xs text-muted-foreground">Peak activity reached - 95% capacity</div>
                  </div>
                  <div className="text-xs text-muted-foreground">2:45 PM</div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Austin Tech Hub</div>
                    <div className="text-xs text-muted-foreground">Moderate activity - 78% capacity</div>
                  </div>
                  <div className="text-xs text-muted-foreground">2:30 PM</div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Chicago Distribution</div>
                    <div className="text-xs text-muted-foreground">Activity increasing - 67% capacity</div>
                  </div>
                  <div className="text-xs text-muted-foreground">2:15 PM</div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">Seattle Research Lab</div>
                    <div className="text-xs text-muted-foreground">Low activity - 34% capacity</div>
                  </div>
                  <div className="text-xs text-muted-foreground">2:00 PM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div>
                    <div className="text-sm font-medium">San Francisco Branch</div>
                    <div className="text-xs text-muted-foreground">Very Busy</div>
                  </div>
                  <Badge className="bg-green-500 text-white">92%</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div>
                    <div className="text-sm font-medium">New York Office</div>
                    <div className="text-xs text-muted-foreground">Very Busy</div>
                  </div>
                  <Badge className="bg-green-500 text-white">85%</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div>
                    <div className="text-sm font-medium">Austin Tech Hub</div>
                    <div className="text-xs text-muted-foreground">Busy</div>
                  </div>
                  <Badge className="bg-yellow-500 text-white">78%</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div>
                    <div className="text-sm font-medium">Chicago Distribution</div>
                    <div className="text-xs text-muted-foreground">Busy</div>
                  </div>
                  <Badge className="bg-yellow-500 text-white">67%</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div>
                    <div className="text-sm font-medium">Miami Sales Office</div>
                    <div className="text-xs text-muted-foreground">Not Busy</div>
                  </div>
                  <Badge className="bg-orange-500 text-white">45%</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div>
                    <div className="text-sm font-medium">Seattle Research Lab</div>
                    <div className="text-xs text-muted-foreground">Not Busy</div>
                  </div>
                  <Badge className="bg-red-500 text-white">34%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
