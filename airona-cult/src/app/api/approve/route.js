import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { discord_id, application } = body;

    if (!discord_id || !application) {
      return NextResponse.json({ error: "Missing discord_id or application" }, { status: 400 });
    }

    // Insert approved member with application_id
    const { error } = await supabase.from("approved_members").insert([
      {
        application_id: application.id, // 🔹 add application_id reference
        discord_id,
        discord_username: application.discord_username,
        planned_ingame_name: application.planned_ingame_name,
        timezone: application.timezone,
        active_time: application.active_time,
        playstyle: application.playstyle,
        planned_main_class: application.planned_main_class,
        favourite_bpsr_activity: application.favourite_bpsr_activity,
        how_found_guild: application.how_found_guild,
        why_join_guild: application.why_join_guild,
        interested_in_events: application.interested_in_events,
        age_range: application.age_range,
        birthday: application.birthday,
        other_questions: application.other_questions,
      },
    ]);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
