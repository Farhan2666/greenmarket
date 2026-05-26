import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/supabase-server";

async function checkAdmin() {
  const user = await getAuthenticatedUser();
  if (!user) return null;
  const { data: profile } = await supabaseAdmin
    .from("User")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role === "ADMIN" ? user : null;
}

export async function GET(request: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "users";

  if (type === "products") {
    const { data, error } = await supabaseAdmin
      .from("Product")
      .select("*, seller:User!seller_id(id, name, email)")
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (type === "orders") {
    const { data, error } = await supabaseAdmin
      .from("Order")
      .select("*, user:User(id, name, email), items:OrderItem(*, product:Product(id, name, images))")
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabaseAdmin
    .from("User")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { type, id, ...updates } = body;

  if (type === "user") {
    if (updates.role) {
      const { error } = await supabaseAdmin
        .from("User")
        .update({ role: updates.role })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (type === "product") {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.price) updateData.price = updates.price;
    if (updates.stock !== undefined) updateData.stock = updates.stock;
    if (updates.category) updateData.category = updates.category;

    const { error } = await supabaseAdmin
      .from("Product")
      .update(updateData)
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (type === "order") {
    if (updates.status) {
      const { error } = await supabaseAdmin
        .from("Order")
        .update({ status: updates.status })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { type, id } = body;

  if (type === "product") {
    const { error } = await supabaseAdmin.from("Product").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (type === "user") {
    const { error } = await supabaseAdmin
      .from("User")
      .update({ role: "BUYER" })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: "User suspended" });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
