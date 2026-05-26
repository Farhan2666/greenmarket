import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("CartItem")
    .select("*, product:Product!product_id(id, name, price, images, category, stock)")
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { product_id, quantity = 1 } = await request.json();

  const { data: existing } = await supabaseAdmin
    .from("CartItem")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", product_id)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from("CartItem")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
  } else {
    await supabaseAdmin
      .from("CartItem")
      .insert({ user_id: user.id, product_id, quantity });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { product_id, quantity } = await request.json();

  if (quantity <= 0) {
    await supabaseAdmin
      .from("CartItem")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", product_id);
  } else {
    await supabaseAdmin
      .from("CartItem")
      .update({ quantity })
      .eq("user_id", user.id)
      .eq("product_id", product_id);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { product_id } = await request.json();
  await supabaseAdmin
    .from("CartItem")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", product_id);

  return NextResponse.json({ success: true });
}
