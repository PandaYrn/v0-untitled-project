import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// PATCH: Update a comment
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const commentId = params.id
    const supabase = createServerSupabaseClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is the comment author
    const { data: comment } = await supabase.from("comments").select("user_id").eq("id", commentId).single()

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check if user is authorized to update
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (comment.user_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json({ error: "Not authorized to update this comment" }, { status: 403 })
    }

    const body = await request.json()
    const { text } = body

    if (!text) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 })
    }

    // Update comment
    const { error } = await supabase
      .from("comments")
      .update({
        text,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Comment updated successfully",
    })
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

// DELETE: Remove a comment
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const commentId = params.id
    const supabase = createServerSupabaseClient()

    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is the comment author
    const { data: comment } = await supabase.from("comments").select("user_id").eq("id", commentId).single()

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check if user is authorized to delete
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (comment.user_id !== user.id && profile?.role !== "admin") {
      return NextResponse.json({ error: "Not authorized to delete this comment" }, { status: 403 })
    }

    // Delete comment
    const { error } = await supabase.from("comments").delete().eq("id", commentId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
