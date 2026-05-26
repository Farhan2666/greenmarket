import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("Wishlist")
    .select("*, product:Product!product_id(id, name, price, images, category, stock, rating)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { product_id } = await request.json();

  const { data: existing } = await supabaseAdmin
    .from("Wishlist")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", product_id)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin.from("Wishlist").delete().eq("id", existing.id);
    return NextResponse.json({ wishlisted: false });
  }

  await supabaseAdmin.from("Wishlist").insert({ user_id: user.id, product_id });
  return NextResponse.json({ wishlisted: true });
}

export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { product_id } = await request.json();
  await supabaseAdmin.from("Wishlist").delete().eq("user_id", user.id).eq("product_id", product_id);
  return NextResponse.json({ success: true });
}
