import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { supabaseServer } from "@/lib/supabaseServer";
import { strictRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  // Apply strict rate limiting for content uploads
  const rateLimitResult = strictRateLimit.check(request);
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const title = formData.get("title");
    const source = formData.get("source");
    const file = formData.get("image");

    // Validate inputs
    if (!title || title.length > 200) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }
    
    if (source && source.length > 500) {
      return NextResponse.json({ error: "Source URL too long" }, { status: 400 });
    }

    let imageUrl = null;
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large" }, { status: 400 });
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
      }

      const filePath = `fanart/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabaseServer.storage
        .from("fanart")
        .upload(filePath, file, { contentType: file.type });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
      }

      const { data } = supabaseServer.storage.from("fanart").getPublicUrl(filePath);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabaseServer.from("fanart").insert([
      {
        title,
        source,
        image_url: imageUrl,
        author: session.user.id,
      },
    ]);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Failed to save fanart" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fanart upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
