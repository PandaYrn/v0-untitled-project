import { createServerSupabaseClient } from "@/lib/supabase/server"
import { ContentForm } from "@/components/content/content-form"
import { redirect } from "next/navigation"

export default async function UploadContentPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Upload Content</h1>
      <ContentForm />
    </div>
  )
}
