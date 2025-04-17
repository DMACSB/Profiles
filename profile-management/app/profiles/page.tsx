import { ProfilesDataTable } from "@/components/profiles-data-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function ProfilesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Profiles</h1>
        <Link href="/profiles/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Profile
          </Button>
        </Link>
      </div>

      <ProfilesDataTable />
    </div>
  )
}
