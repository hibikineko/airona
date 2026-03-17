import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { lenientRateLimit } from "@/lib/rateLimit";

export async function GET(request) {
  console.log('[TWIN API] GET request received');
  
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
    
    console.log('[TWIN API] Query params:', { page, pageSize });
    
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabaseServer
      .from("twin")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);

    console.log('[TWIN API] Supabase response:', { data: data?.length || 0, error });

    if (error) {
      console.error("[TWIN API] Twin fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch twin" }, 
        { status: 500 }
      );
    }

    console.log('[TWIN API] Returning data:', data);
    return NextResponse.json({
      data,
      page,
      pageSize,
      hasMore: data.length === pageSize
    });

  } catch (error) {
    console.error("Twin API error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
