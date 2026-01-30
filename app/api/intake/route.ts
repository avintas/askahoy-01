import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

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
    const { business_name, contact_email } = body;

    if (!business_name || !contact_email) {
      return NextResponse.json(
        { error: "Business name and contact email are required" },
        { status: 400 }
      );
    }

    // Create project
    const { data: project, error } = await supabase
      .from("aska_projects")
      .insert({
        user_id: user.id,
        business_name,
        contact_email,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return NextResponse.json(
        { error: "Failed to create project" },
        { status: 500 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Intake error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process intake",
      },
      { status: 500 }
    );
  }
}
