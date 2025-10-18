import { supabase } from "@/lib/supabaseClient";

// fetch latest fanart
// fetch fanart with offset + limit
export async function fetchFanart(page = 0, pageSize = 12) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("fanart")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  console.log('fanart data:', data);
  return data;
}


// fetch latest screenshots
export async function fetchScreenshots(page = 0, pageSize = 12) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("screenshot")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return data;
}


// fetch latest sesbian
export async function fetchSesbian(page = 0, pageSize = 12) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("sesbian")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
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
