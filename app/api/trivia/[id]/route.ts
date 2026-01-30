import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { id } = await params;

    // Public access for shareable trivia (no auth required)
    const { data: trivia, error } = await supabase
      .from("aska_trivia_experiences")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !trivia) {
      return NextResponse.json(
        { error: "Trivia experience not found" },
        { status: 404 }
      );
    }

    // If not shareable, require auth
    if (!trivia.shareable_url) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || trivia.user_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({ trivia });
  } catch (error) {
    console.error("Trivia fetch error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch trivia experience",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, questions, shareable_url } = body;

    // Check if user owns the trivia or is editor
    const { data: existingTrivia } = await supabase
      .from("aska_trivia_experiences")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existingTrivia) {
      return NextResponse.json(
        { error: "Trivia experience not found" },
        { status: 404 }
      );
    }

    // TODO: Add editor role check
    if (existingTrivia.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (questions !== undefined) updateData.questions = questions;
    if (shareable_url !== undefined) updateData.shareable_url = shareable_url;

    const { data: trivia, error } = await supabase
      .from("aska_trivia_experiences")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating trivia:", error);
      return NextResponse.json(
        { error: "Failed to update trivia experience" },
        { status: 500 }
      );
    }

    return NextResponse.json({ trivia });
  } catch (error) {
    console.error("Trivia update error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update trivia experience",
      },
      { status: 500 }
    );
  }
}
