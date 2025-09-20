import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("approved_members")
      .select(
        `application_id,
         discord_id,
         planned_main_class,
         age_range,
         timezone,
         active_time_utc,
         playstyle,
         favourite_bpsr_activity`
      );

    if (error) throw error;

    // Map to a new array safely
    const formattedData = (data || []).map(member => ({
      application_id: member.application_id,
      discord_id: member.discord_id,
      planned_main_class: member.planned_main_class,
      age_range: member.age_range,
      timezone: member.timezone,
      active_time_utc: Array.isArray(member.active_time_utc) ? member.active_time_utc : [],
      playstyle: member.playstyle,
      favourite_bpsr_activity: member.favourite_bpsr_activity || "Unknown",
    }));

    return NextResponse.json(formattedData);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
