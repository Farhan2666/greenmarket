import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/supabase-server";

async function requireSeller() {
  const user = await getAuthenticatedUser();
  if (!user) return null;
  const { data: profile } = await supabaseAdmin.from("User").select("role").eq("id", user.id).single();
  return profile?.role === "SELLER" ? user : null;
}

export async function POST(request: Request) {
  const user = await requireSeller();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, description, price, images, category, stock } = await request.json();
  if (!name || !price || !category) {
    return NextResponse.json({ error: "Name, price, and category required" }, { status: 400 });
  }

  const { data: maxProduct } = await supabaseAdmin
    .from("Product")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();

  const nextNum = maxProduct?.id ? parseInt(maxProduct.id.replace(/\D/g, "")) + 1 : 5;
  const productId = `p${nextNum}`;

  const { data, error } = await supabaseAdmin
    .from("Product")
    .insert({
      id: productId, name, description: description || "", price: Number(price),
      images: images?.length ? images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
      category, stock: Number(stock) || 0, seller_id: user.id, rating: 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const user = await requireSeller();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, name, description, price, images, category, stock } = await request.json();

  const { data: existing } = await supabaseAdmin
    .from("Product")
    .select("seller_id")
    .eq("id", id)
    .single();

  if (!existing || existing.seller_id !== user.id) {
    return NextResponse.json({ error: "Not your product" }, { status: 403 });
  }

  const updates: any = {};
  if (name) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price) updates.price = Number(price);
  if (images) updates.images = images;
  if (category) updates.category = category;
  if (stock !== undefined) updates.stock = Number(stock);

  const { error } = await supabaseAdmin.from("Product").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
