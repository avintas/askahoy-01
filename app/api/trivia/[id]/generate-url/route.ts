import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(
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

    // Generate shareable URL (using the trivia ID)
    const shareableUrl = id;

    const { data: trivia, error } = await supabase
      .from("aska_trivia_experiences")
      .update({
        shareable_url: shareableUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error generating URL:", error);
      return NextResponse.json(
        { error: "Failed to generate shareable URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      trivia,
      url: `${process.env.NEXT_PUBLIC_aska_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/play/${id}`,
    });
  } catch (error) {
    console.error("Generate URL error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate shareable URL",
      },
      { status: 500 }
    );
  }
}
