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

    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // 'project' or 'trivia'

    if (type === "project") {
      // Get analytics for a project
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data: events, error } = await supabase
        .from("aska_analytics_events")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching project analytics:", error);
        return NextResponse.json(
          { error: "Failed to fetch analytics" },
          { status: 500 }
        );
      }

      // Aggregate analytics
      const views = events?.filter((e) => e.event_type === "view").length || 0;
      const completions =
        events?.filter((e) => e.event_type === "quiz_complete").length || 0;
      const starts =
        events?.filter((e) => e.event_type === "start").length || 0;

      return NextResponse.json({
        views,
        starts,
        completions,
        completionRate: starts > 0 ? (completions / starts) * 100 : 0,
        events: events || [],
      });
    } else {
      // Get analytics for a trivia experience
      const { data: events, error } = await supabase
        .from("aska_analytics_events")
        .select("*")
        .eq("experience_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching trivia analytics:", error);
        return NextResponse.json(
          { error: "Failed to fetch analytics" },
          { status: 500 }
        );
      }

      // Aggregate analytics
      const views = events?.filter((e) => e.event_type === "view").length || 0;
      const completions =
        events?.filter((e) => e.event_type === "quiz_complete").length || 0;
      const starts =
        events?.filter((e) => e.event_type === "start").length || 0;

      return NextResponse.json({
        views,
        starts,
        completions,
        completionRate: starts > 0 ? (completions / starts) * 100 : 0,
        events: events || [],
      });
    }
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch analytics",
      },
      { status: 500 }
    );
  }
}
