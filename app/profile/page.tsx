import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/profile/profile-form"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <ProfileForm initialProfile={profile || undefined} />
    </div>
  )
}
