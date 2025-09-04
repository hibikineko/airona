import { supabase } from "@/lib/supabaseClient";

// fetch latest fanart
export async function fetchFanart(limit = 10) {
  const { data, error } = await supabase
    .from("fanart")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}

// fetch latest screenshots
export async function fetchScreenshots(limit = 10) {
  const { data, error } = await supabase
    .from("screenshot")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  console.log("Fetched screenshots:", data);
  return data;
}

// fetch latest posts
export async function fetchPosts(limit = 10) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}
