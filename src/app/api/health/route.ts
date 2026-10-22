import { NextResponse } from "next/server";
import { getClient } from "@/lib/payload";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "connected";

  try {
    const payload = await getClient();
    // Test database query
    await payload.find({
      collection: "users",
      limit: 1,
      depth: 0,
    });
  } catch (error) {
    dbStatus = "error";
  }

  const responseTime = Date.now() - startTime;

  return NextResponse.json(
    {
      status: dbStatus === "connected" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      latencyMs: responseTime,
      environment: process.env.NODE_ENV || "development",
    },
    {
      status: dbStatus === "connected" ? 200 : 503,
    },
  );
}
