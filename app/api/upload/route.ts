import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { extractTextFromFile } from "@/lib/utils/file-extraction";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Extract text from file
    const { text, mimeType } = await extractTextFromFile(file);

    // Store document in database
    const { data: document, error } = await supabase
      .from("aska_documents")
      .insert({
        project_id: projectId || null,
        user_id: user.id,
        file_name: file.name,
        file_content: text,
        file_size: file.size,
        mime_type: mimeType,
      })
      .select()
      .single();

    if (error) {
      console.error("Error storing document:", error);
      return NextResponse.json(
        { error: "Failed to store document" },
        { status: 500 }
      );
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process file",
      },
      { status: 500 }
    );
  }
}
