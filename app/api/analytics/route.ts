import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const {
      experience_id,
      project_id,
      user_id,
      event_type,
      question_id,
      metadata,
    } = body;

    if (!experience_id || !project_id || !event_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: event, error } = await supabase
      .from("aska_analytics_events")
      .insert({
        experience_id,
        project_id,
        user_id: user_id || null,
        event_type,
        question_id: question_id || null,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating analytics event:", error);
      return NextResponse.json(
        { error: "Failed to create analytics event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create analytics event",
      },
      { status: 500 }
    );
  }
}
