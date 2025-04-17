"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Edit, FileDown, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Profile = {
  id: string
  name: string
  gender: string
  age: number
  date_of_birth: string
  photo_url: string
  language_spoken: string
  physical_identifiers: string
  mode_of_entry: string
  entry_point: string
  date_of_entry: string
  assisting_network: string
  last_known_address: string
  current_location: string
  migration_pattern: string
  associated_locations: string
  current_occupation: string
  cover_identity: string
  support_network: string
  criminal_background: string
  case_registered: string
  detained_by: string
  court_proceedings_status: string
  embassy_contacted: boolean
  seized_ids: string
  intelligence_dossier: string
  created_at: string
}

export function ProfileDetail({ profile }: { profile: Profile }) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", profile.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile deleted successfully",
      })

      router.push("/profiles")
      router.refresh()
    } catch (error) {
      console.error("Error deleting profile:", error)
      toast({
        title: "Error",
        description: "Failed to delete profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const exportProfile = () => {
    // Convert profile to CSV
    const csvContent = Object.entries(profile)
      .map(([key, value]) => {
        // Handle special cases
        if (key === "embassy_contacted") {
          return `${key},${value ? "Yes" : "No"}`
        }
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `${key},"${value.replace(/"/g, '""')}"`
        }
        return `${key},${value}`
      })
      .join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `profile-${profile.name.replace(/\s+/g, "-")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Profile Details</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportProfile}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => router.push(`/profiles/${profile.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the profile and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.photo_url || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{profile.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{profile.gender}</Badge>
                <Badge variant="outline">{profile.age} years old</Badge>
                {profile.current_occupation && <Badge variant="outline">{profile.current_occupation}</Badge>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date of Birth</h3>
                  <p>{profile.date_of_birth ? format(new Date(profile.date_of_birth), "PPP") : "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Language Spoken</h3>
                  <p>{profile.language_spoken || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Physical Identifiers</h3>
                  <p>{profile.physical_identifiers || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Entry Information Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Entry Information</h2>
              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Mode of Entry</h3>
                  <p>{profile.mode_of_entry || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Entry Point</h3>
                  <p>{profile.entry_point || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date of Entry</h3>
                  <p>{profile.date_of_entry ? format(new Date(profile.date_of_entry), "PPP") : "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Assisting Network</h3>
                  <p>{profile.assisting_network || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Migration Pattern</h3>
                  <p>{profile.migration_pattern || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Location Information Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Location Information</h2>
              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Known Address</h3>
                  <p>{profile.last_known_address || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Current Location</h3>
                  <p>{profile.current_location || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Associated Locations</h3>
                  <p>{profile.associated_locations || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Identity Information Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Identity Information</h2>
              <Separator />

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Current Occupation</h3>
                  <p>{profile.current_occupation || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Cover Identity</h3>
                  <p>{profile.cover_identity || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Support Network</h3>
                  <p>{profile.support_network || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Seized IDs</h3>
                  <p>{profile.seized_ids || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Legal Information Section */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-xl font-semibold">Legal Information</h2>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Criminal Background</h3>
                  <p>{profile.criminal_background || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Case Registered</h3>
                  <p>{profile.case_registered || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Detained By</h3>
                  <p>{profile.detained_by || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Court Proceedings Status</h3>
                  <p>{profile.court_proceedings_status || "N/A"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Embassy Contacted</h3>
                  <p>{profile.embassy_contacted ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>

            {/* Intelligence Dossier Section */}
            <div className="space-y-4 md:col-span-2">
              <h2 className="text-xl font-semibold">Intelligence Dossier</h2>
              <Separator />

              <div>
                <p className="whitespace-pre-line">
                  {profile.intelligence_dossier || "No intelligence dossier available."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
