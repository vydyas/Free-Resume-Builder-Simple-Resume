import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body as { username?: string; password?: string };

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("admins")
      .select("id, username, password")
      .eq("username", username)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (data.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Auth] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
