import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/supabase-server";

async function requireSeller() {
  const user = await getAuthenticatedUser();
  if (!user) return null;
  const { data: profile } = await supabaseAdmin.from("User").select("role").eq("id", user.id).maybeSingle();
  return profile?.role === "SELLER" ? user : null;
}

export async function POST(request: Request) {
  const user = await requireSeller();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, description, price, images, category, stock } = await request.json();
  if (!name || !price || !category) {
    return NextResponse.json({ error: "Name, price, and category required" }, { status: 400 });
  }

  const { data: allProducts } = await supabaseAdmin
    .from("Product")
    .select("id");

  const nums = (allProducts || [])
    .map((p: any) => {
      const n = parseInt(p.id.replace(/\D/g, ""));
      return isNaN(n) ? 0 : n;
    })
    .filter((n: number) => n > 0);

  const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
  const productId = `p${maxNum + 1}`;

  const { data, error } = await supabaseAdmin
    .from("Product")
    .insert({
      id: productId, name, description: description || "", price: Number(price),
      images: images?.length ? images : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"],
      category, stock: Number(stock) || 0, seller_id: user.id, rating: 0,
    })
    .select()
    .maybeSingle();

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
    .maybeSingle();

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
