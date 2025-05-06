import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // media, thumbnail, avatar

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!type) {
      return NextResponse.json({ error: "File type is required" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes: Record<string, string[]> = {
      media: ["audio/mpeg", "audio/wav", "video/mp4", "video/quicktime"],
      thumbnail: ["image/jpeg", "image/png", "image/webp"],
      avatar: ["image/jpeg", "image/png", "image/webp"],
    }
    \
    if (!allowedTypes[type]?.includes(file.type)) {
      "image/png\", \"image/webp\"]
    }

    if (!allowedTypes[type]?.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types for ${type}: ${allowedTypes[type].join(", ")}` },
        { status: 400 },
      )
    }

    // Validate file size
    const maxSizes: Record<string, number> = {
      media: 100 * 1024 * 1024, // 100MB
      thumbnail: 5 * 1024 * 1024, // 5MB
      avatar: 2 * 1024 * 1024, // 2MB
    }

    if (file.size > maxSizes[type]) {
      return NextResponse.json(
        { error: `File too large. Maximum size for ${type}: ${maxSizes[type] / (1024 * 1024)}MB` },
        { status: 400 },
      )
    }

    // Generate file path
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath =
      type === "avatar" ? `avatars/${fileName}` : type === "thumbnail" ? `thumbnails/${fileName}` : `media/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("soundwave").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage.from("soundwave").getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
