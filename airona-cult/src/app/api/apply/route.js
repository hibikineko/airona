import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const data = await req.json();

    const { error } = await supabase.from("guild_applications").insert([
      {
        discord_username: data.discord_username,
        planned_ingame_name: data.planned_ingame_name,
        timezone: data.timezone,
        active_time: data.active_time,
        playstyle: data.playstyle,
        planned_main_class: data.planned_main_class,
        favourite_bpsr_activity: data.favourite_bpsr_activity,
        how_found_guild: data.how_found_guild,
        why_join_guild: data.why_join_guild,
        interested_in_events: data.interested_in_events === "true",
        age_range: data.age_range || null,
        birthday: data.birthday || null,
        other_questions: data.other_questions || null,
      },
    ]);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving application:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
