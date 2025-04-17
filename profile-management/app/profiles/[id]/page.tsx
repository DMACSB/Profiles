import { ProfileDetail } from "@/components/profile-detail"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", params.id).single()

  if (!profile) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <ProfileDetail profile={profile} />
    </div>
  )
}
