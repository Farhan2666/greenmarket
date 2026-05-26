import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("User")
    .select("id, email, name, avatar_url, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  if (!profile) {
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from("User")
      .insert({ id: user.id, email: user.email, name: user.user_metadata?.name || "", role: "BUYER" })
      .select("id, email, name, avatar_url, role, created_at")
      .maybeSingle();
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    return NextResponse.json(newProfile);
  }

  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const updates: any = {};
  if (body.name) updates.name = body.name;
  if (body.avatar_url) updates.avatar_url = body.avatar_url;
  if (body.role === "SELLER") updates.role = "SELLER";

  const { data, error } = await supabaseAdmin
    .from("User")
    .update(updates)
    .eq("id", user.id)
    .select("id, email, name, avatar_url, role, created_at")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
