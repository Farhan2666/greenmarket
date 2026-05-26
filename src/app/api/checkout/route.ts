import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items } = await request.json();
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  let total = 0;
  const orderItems: any[] = [];

  for (const item of items) {
    const { data: product } = await supabaseAdmin
      .from("Product")
      .select("id, price, stock")
      .eq("id", `p${item.productId}`)
      .single();

    if (!product || product.stock < item.quantity) {
      return NextResponse.json({ error: `${item.productName || "Product"} out of stock` }, { status: 400 });
    }

    total += product.price * item.quantity;
    orderItems.push({ product_id: product.id, quantity: item.quantity, price: product.price });

    await supabaseAdmin
      .from("Product")
      .update({ stock: product.stock - item.quantity })
      .eq("id", product.id);
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("Order")
    .insert({ user_id: user.id, total, status: "PENDING" })
    .select()
    .single();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

  const { error: itemsError } = await supabaseAdmin
    .from("OrderItem")
    .insert(orderItems.map((oi) => ({ ...oi, order_id: order.id })));

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

  await supabaseAdmin.from("CartItem").delete().eq("user_id", user.id);

  return NextResponse.json({ orderId: order.id, total });
}
