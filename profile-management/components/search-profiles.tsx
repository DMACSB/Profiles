"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDebounce } from "use-debounce"
import { Search, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Profile = {
  id: string
  name: string
  gender: string
  age: number
  date_of_birth: string
  photo_url: string
  language_spoken: string
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

export function SearchProfiles() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)
  const [results, setResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [genderFilter, setGenderFilter] = useState<string | null>(null)
  const [locationFilter, setLocationFilter] = useState<string | null>(null)
  const [occupationFilter, setOccupationFilter] = useState<string | null>(null)
  const [locations, setLocations] = useState<string[]>([])
  const [occupations, setOccupations] = useState<string[]>([])

  useEffect(() => {
    // Fetch distinct locations and occupations for filters
    async function fetchFilterOptions() {
      try {
        // Get distinct locations
        const { data: locationData } = await supabase
          .from("profiles")
          .select("current_location")
          .not("current_location", "is", null)

        const uniqueLocations = Array.from(
          new Set(locationData?.map((item) => item.current_location).filter(Boolean) as string[]),
        ).sort()

        setLocations(uniqueLocations)

        // Get distinct occupations
        const { data: occupationData } = await supabase
          .from("profiles")
          .select("current_occupation")
          .not("current_occupation", "is", null)

        const uniqueOccupations = Array.from(
          new Set(occupationData?.map((item) => item.current_occupation).filter(Boolean) as string[]),
        ).sort()

        setOccupations(uniqueOccupations)
      } catch (error) {
        console.error("Error fetching filter options:", error)
      }
    }

    fetchFilterOptions()
  }, [supabase])

  useEffect(() => {
    async function performSearch() {
      if (!debouncedSearchTerm && !genderFilter && !locationFilter && !occupationFilter) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        let query = supabase.from("profiles").select("*")

        // Apply search term if provided
        if (debouncedSearchTerm) {
          query = query.or(
            `name.ilike.%${debouncedSearchTerm}%,` +
              `current_location.ilike.%${debouncedSearchTerm}%,` +
              `current_occupation.ilike.%${debouncedSearchTerm}%,` +
              `language_spoken.ilike.%${debouncedSearchTerm}%,` +
              `mode_of_entry.ilike.%${debouncedSearchTerm}%,` +
              `entry_point.ilike.%${debouncedSearchTerm}%,` +
              `assisting_network.ilike.%${debouncedSearchTerm}%,` +
              `last_known_address.ilike.%${debouncedSearchTerm}%,` +
              `migration_pattern.ilike.%${debouncedSearchTerm}%,` +
              `associated_locations.ilike.%${debouncedSearchTerm}%,` +
              `cover_identity.ilike.%${debouncedSearchTerm}%,` +
              `support_network.ilike.%${debouncedSearchTerm}%,` +
              `criminal_background.ilike.%${debouncedSearchTerm}%,` +
              `case_registered.ilike.%${debouncedSearchTerm}%,` +
              `detained_by.ilike.%${debouncedSearchTerm}%,` +
              `court_proceedings_status.ilike.%${debouncedSearchTerm}%,` +
              `seized_ids.ilike.%${debouncedSearchTerm}%,` +
              `intelligence_dossier.ilike.%${debouncedSearchTerm}%`,
          )
        }

        // Apply filters if provided
        if (genderFilter) {
          query = query.eq("gender", genderFilter)
        }

        if (locationFilter) {
          query = query.eq("current_location", locationFilter)
        }

        if (occupationFilter) {
          query = query.eq("current_occupation", occupationFilter)
        }

        const { data, error } = await query.order("created_at", { ascending: false })

        if (error) throw error

        setResults(data || [])
      } catch (error) {
        console.error("Error searching profiles:", error)
        toast({
          title: "Error",
          description: "Failed to search profiles. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [debouncedSearchTerm, genderFilter, locationFilter, occupationFilter, supabase, toast])

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const exportResults = () => {
    // Convert results to CSV
    const headers = [
      "name",
      "gender",
      "age",
      "date_of_birth",
      "language_spoken",
      "mode_of_entry",
      "entry_point",
      "date_of_entry",
      "assisting_network",
      "last_known_address",
      "current_location",
      "migration_pattern",
      "associated_locations",
      "current_occupation",
      "cover_identity",
      "support_network",
      "criminal_background",
      "case_registered",
      "detained_by",
      "court_proceedings_status",
      "embassy_contacted",
      "seized_ids",
      "intelligence_dossier",
    ]

    const csvContent = [
      headers.join(","),
      ...results.map((profile) =>
        headers
          .map((header) => {
            const value = profile[header as keyof Profile]
            // Handle commas and quotes in the data
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          })
          .join(","),
      ),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `search-results-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search profiles by any field..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select
                value={genderFilter || "all"}
                onValueChange={(value) => setGenderFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={locationFilter || "all"}
                onValueChange={(value) => setLocationFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={occupationFilter || "all"}
                onValueChange={(value) => setOccupationFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Occupation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Occupations</SelectItem>
                  {occupations.map((occupation) => (
                    <SelectItem key={occupation} value={occupation}>
                      {occupation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {results.length > 0 && (
                <Button variant="outline" onClick={exportResults}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Results
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Occupation</TableHead>
                  <TableHead>Entry Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Searching profiles...
                    </TableCell>
                  </TableRow>
                ) : results.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {debouncedSearchTerm || genderFilter || locationFilter || occupationFilter
                        ? "No profiles found matching your search criteria."
                        : "Enter a search term or select filters to find profiles."}
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((profile) => (
                    <TableRow
                      key={profile.id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/profiles/${profile.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profile.photo_url || "/placeholder.svg"} alt={profile.name} />
                            <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{profile.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{profile.gender}</Badge>
                      </TableCell>
                      <TableCell>{profile.age}</TableCell>
                      <TableCell>{profile.current_location || "N/A"}</TableCell>
                      <TableCell>{profile.current_occupation || "N/A"}</TableCell>
                      <TableCell>
                        {profile.date_of_entry ? format(new Date(profile.date_of_entry), "PPP") : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {results.length > 0 && (
            <div className="text-sm text-muted-foreground text-right">
              Showing {results.length} result{results.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
