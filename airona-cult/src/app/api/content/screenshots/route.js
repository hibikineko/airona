import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { lenientRateLimit } from "@/lib/rateLimit";

export async function GET(request) {
  // Apply rate limiting
  const rateLimitResult = lenientRateLimit.check(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: rateLimitResult.error }, 
      { 
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter.toString()
        }
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '12'), 50); // Max 50 items
    
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabaseServer
      .from("screenshot")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Screenshot fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch screenshots" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      page,
      pageSize,
      hasMore: data.length === pageSize
    });

  } catch (error) {
    console.error("Screenshot API error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}