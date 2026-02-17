// Secure server-side content fetching using internal API routes
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://airona.club/api' 
  : 'http://localhost:3000/api';

// Fetch fanart with pagination
export async function fetchFanart(page = 0, pageSize = 12) {
  try {
    const response = await fetch(
      `${API_BASE}/content/fanart?page=${page}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Important: Use cache for server-side calls
        cache: 'force-cache',
        next: { revalidate: 300 } // Revalidate every 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch fanart: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching fanart:', error);
    return [];
  }
}

// Fetch screenshots with pagination
export async function fetchScreenshots(page = 0, pageSize = 12) {
  try {
    const response = await fetch(
      `${API_BASE}/content/screenshots?page=${page}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'force-cache',
        next: { revalidate: 300 }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch screenshots: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching screenshots:', error);
    return [];
  }
}

// Fetch sesbian with pagination
export async function fetchSesbian(page = 0, pageSize = 12) {
  try {
    const response = await fetch(
      `${API_BASE}/content/sesbian?page=${page}&pageSize=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'force-cache',
        next: { revalidate: 300 }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch sesbian: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching sesbian:', error);
    return [];
  }
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
