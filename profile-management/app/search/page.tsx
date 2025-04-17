import { SearchProfiles } from "@/components/search-profiles"

export default function SearchPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Search Profiles</h1>
      <SearchProfiles />
    </div>
  )
}
