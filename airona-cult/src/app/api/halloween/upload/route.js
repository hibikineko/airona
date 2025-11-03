import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    // Check if user is a member
    const { data: member } = await supabaseServer
      .from("members")
      .select("id")
      .eq("discord_id", session.user.id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json(
        { error: "Only guild members can upload submissions" },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const image = formData.get("image");
    const authorName = formData.get("authorName");

    if (!image || !authorName) {
      return NextResponse.json(
        { error: "Image and author name are required" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 10MB)" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `halloween_${timestamp}_${image.name.replace(/\s+/g, "_")}`;

    // Upload to Supabase Storage using server client
    const { error: uploadError } = await supabaseServer.storage
      .from("halloween")
      .upload(filename, image, {
        contentType: image.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image: " + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseServer.storage
      .from("halloween")
      .getPublicUrl(filename);

    // Insert submission record into database
    const { data: submission, error: dbError } = await supabaseServer
      .from("halloween_submissions")
      .insert([
        {
          image_url: urlData.publicUrl,
          author_name: authorName,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission,
      message: "Halloween submission uploaded successfully!",
    });
  } catch (error) {
    console.error("Error in halloween upload:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch all submissions
export async function GET(req) {
  try {
    const { data: submissions, error } = await supabaseServer
      .from("halloween_submissions")
      .select("*")
      .eq("is_active", true)
      .order("upload_date", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
