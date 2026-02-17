import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

// Admin Discord IDs - these users have upload permissions
// Add your Discord IDs here or use environment variable
const ADMIN_IDS = process.env.ADMIN_DISCORD_IDS?.split(',') || [];

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    const isAdmin = ADMIN_IDS.includes(session.user.id);
    
    return NextResponse.json({ isAdmin }, { status: 200 });
  } catch (error) {
    console.error("Admin check error:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}

// Helper function to check if user is admin (can be imported by other routes)
export async function isUserAdmin(session) {
  if (!session?.user?.id) return false;
  return ADMIN_IDS.includes(session.user.id);
}
