import { useSession } from "next-auth/react";
import { supabase } from "../utils/supabaseClient";

async function uploadFanart(file, title, description, session) {
  const fileName = `${session.user.id}-${Date.now()}-${file.name}`;
  
  const { error: uploadError } = await supabase.storage
    .from("fanart")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: publicUrl } = supabase.storage
    .from("fanart")
    .getPublicUrl(fileName);

  await supabase.from("fanart_posts").insert([
    {
      user_id: session.user.id, // Discord ID
      title,
      description,
      image_url: publicUrl.publicUrl,
    },
  ]);
}
