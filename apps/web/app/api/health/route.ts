import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Health check endpoint for uptime monitors and client graceful degradation probes.
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const supabase = createAdminClient();

  try {
    // Quick query to check database connectivity
    const { error } = await supabase.from("locations").select("id").limit(1);

    if (error) {
      console.warn("Health check DB query error:", error);
      return NextResponse.json(
        {
          status: "degraded",
          dbConnected: false,
          timestamp,
          message: "Database connection degraded.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        dbConnected: true,
        timestamp,
        version: "0.1.0",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Health check unexpected error:", err);
    return NextResponse.json(
      {
        status: "offline",
        dbConnected: false,
        timestamp,
        message: "Backend unreachable.",
      },
      { status: 503 }
    );
  }
}
