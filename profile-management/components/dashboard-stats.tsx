"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/lib/supabase-provider"
import { Users, MapPin, Briefcase, Calendar } from "lucide-react"

export function DashboardStats() {
  const { supabase } = useSupabase()
  const [stats, setStats] = useState({
    totalProfiles: 0,
    maleCount: 0,
    femaleCount: 0,
    otherCount: 0,
    topLocation: "N/A",
    topOccupation: "N/A",
    recentEntries: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get total profiles
        const { count: totalProfiles } = await supabase.from("profiles").select("*", { count: "exact", head: true })

        // Get gender counts
        const { data: genderData } = await supabase.from("profiles").select("gender")

        const maleCount = genderData?.filter((p) => p.gender === "Male").length || 0
        const femaleCount = genderData?.filter((p) => p.gender === "Female").length || 0
        const otherCount = genderData?.filter((p) => p.gender !== "Male" && p.gender !== "Female").length || 0

        // Get top location
        const { data: locationData } = await supabase
          .from("profiles")
          .select("current_location")
          .not("current_location", "is", null)

        const locationCounts =
          locationData?.reduce(
            (acc, curr) => {
              acc[curr.current_location] = (acc[curr.current_location] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          ) || {}

        const topLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

        // Get top occupation
        const { data: occupationData } = await supabase
          .from("profiles")
          .select("current_occupation")
          .not("current_occupation", "is", null)

        const occupationCounts =
          occupationData?.reduce(
            (acc, curr) => {
              acc[curr.current_occupation] = (acc[curr.current_occupation] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          ) || {}

        const topOccupation = Object.entries(occupationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

        // Get recent entries (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: recentData } = await supabase
          .from("profiles")
          .select("date_of_entry")
          .gte("date_of_entry", thirtyDaysAgo.toISOString())

        const recentEntries = recentData?.length || 0

        setStats({
          totalProfiles: totalProfiles || 0,
          maleCount,
          femaleCount,
          otherCount,
          topLocation,
          topOccupation,
          recentEntries,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "Loading..." : stats.totalProfiles}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {loading ? "" : `${stats.maleCount} male, ${stats.femaleCount} female, ${stats.otherCount} other`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Location</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "Loading..." : stats.topLocation}</div>
          <p className="text-xs text-muted-foreground mt-1">Most common current location</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Occupation</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "Loading..." : stats.topOccupation}</div>
          <p className="text-xs text-muted-foreground mt-1">Most common occupation</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Entries</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "Loading..." : stats.recentEntries}</div>
          <p className="text-xs text-muted-foreground mt-1">New profiles in last 30 days</p>
        </CardContent>
      </Card>
    </div>
  )
}
