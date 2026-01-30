import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { convertDocumentToTrivia } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { document_id, project_id, title } = body;

    if (!document_id || !project_id) {
      return NextResponse.json(
        { error: "Document ID and Project ID are required" },
        { status: 400 }
      );
    }

    // Fetch document
    const { data: document, error: docError } = await supabase
      .from("aska_documents")
      .select("*")
      .eq("id", document_id)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Convert document to trivia using AI
    const triviaQuestions = await convertDocumentToTrivia(
      document.file_content
    );

    // Create trivia experience
    const { data: trivia, error: triviaError } = await supabase
      .from("aska_trivia_experiences")
      .insert({
        project_id,
        user_id: document.user_id,
        title: title || `Trivia from ${document.file_name}`,
        questions: triviaQuestions,
        ai_generated: true,
      })
      .select()
      .single();

    if (triviaError) {
      console.error("Error creating trivia:", triviaError);
      return NextResponse.json(
        { error: "Failed to create trivia experience" },
        { status: 500 }
      );
    }

    return NextResponse.json({ trivia });
  } catch (error) {
    console.error("Process document error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process document",
      },
      { status: 500 }
    );
  }
}
