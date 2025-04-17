"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/lib/supabase-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

type Profile = {
  id: string
  name: string
  gender: string
  age: number
  current_location: string
  date_of_entry: string
  photo_url: string
  created_at: string
}

export function RecentProfiles() {
  const { supabase } = useSupabase()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentProfiles() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) throw error

        setProfiles(data || [])
      } catch (error) {
        console.error("Error fetching recent profiles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentProfiles()
  }, [supabase])

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Profiles</CardTitle>
        <CardDescription>The latest profiles added to the system</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading recent profiles...</div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-4">No profiles found</div>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile) => (
              <Link
                href={`/profiles/${profile.id}`}
                key={profile.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={profile.photo_url || "/placeholder.svg"} alt={profile.name} />
                    <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">{profile.current_location || "Unknown location"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{profile.gender}</Badge>
                  <div className="text-sm text-muted-foreground">
                    {profile.created_at ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true }) : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
