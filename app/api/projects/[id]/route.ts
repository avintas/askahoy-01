import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
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

    // Fetch project with documents and trivia experiences
    const { data: project, error: projectError } = await supabase
      .from("aska_projects")
      .select("*")
      .eq("id", id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check access (user must own project or be editor)
    // TODO: Add editor role check
    if (project.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch related documents
    const { data: documents } = await supabase
      .from("aska_documents")
      .select("*")
      .eq("project_id", id)
      .order("uploaded_at", { ascending: false });

    // Fetch trivia experiences
    const { data: triviaExperiences } = await supabase
      .from("aska_trivia_experiences")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      project,
      documents: documents || [],
      triviaExperiences: triviaExperiences || [],
    });
  } catch (error) {
    console.error("Project detail error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch project details",
      },
      { status: 500 }
    );
  }
}
