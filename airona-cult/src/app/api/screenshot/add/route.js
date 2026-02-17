import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Admin Discord IDs - must match check-admin route
const ADMIN_IDS = process.env.ADMIN_DISCORD_IDS?.split(',') || [];

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Check if user is admin
  const isAdmin = ADMIN_IDS.includes(session.user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const formData = await req.formData();
  const title = formData.get("title");
  const file = formData.get("image");

  let imageUrl = null;
  if (file) {
    const filePath = `screenshot/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("screenshot")
      .upload(filePath, file, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from("screenshot").getPublicUrl(filePath);
    imageUrl = data.publicUrl;
  }

  const { error } = await supabaseAdmin.from("screenshot").insert([
    {
      title,
      image_url: imageUrl,
      author: session.user.id, // screenshot.author is bigint (discord_id)
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
