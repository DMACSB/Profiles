import { ProfileForm } from "@/components/profile-form"

export default function NewProfilePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Add New Profile</h1>
      <ProfileForm />
    </div>
  )
}
