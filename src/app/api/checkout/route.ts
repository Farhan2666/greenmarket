import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/supabase-server";

const PAYMENT_INFO: Record<string, { bank: string; name: string; number: string }> = {
  bca:   { bank: "BCA",        name: "PT Greenmarket Indonesia", number: "1234567890" },
  mandiri: { bank: "Mandiri",  name: "PT Greenmarket Indonesia", number: "9876543210" },
  bri:   { bank: "BRI",        name: "PT Greenmarket Indonesia", number: "5556667777" },
  gopay: { bank: "GoPay",      name: "greenmarket-official",     number: "081234567890" },
};

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items, payment_method, shipping_address } = await request.json();
  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  if (!payment_method || !PAYMENT_INFO[payment_method]) {
    return NextResponse.json({ error: "Pilih metode pembayaran" }, { status: 400 });
  }
  if (!shipping_address?.name || !shipping_address?.phone || !shipping_address?.street || !shipping_address?.city) {
    return NextResponse.json({ error: "Lengkapi alamat pengiriman" }, { status: 400 });
  }

  let total = 0;
  const orderItems: any[] = [];

  for (const item of items) {
    const { data: product } = await supabaseAdmin
      .from("Product")
      .select("id, price, stock")
      .eq("id", `p${item.productId}`)
      .single();

    if (!product) {
      return NextResponse.json({ error: `${item.productName || "Product"} tidak ditemukan` }, { status: 400 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Stok ${item.productName || "Product"} tidak mencukupi (sisa ${product.stock})` }, { status: 400 });
    }

    total += product.price * item.quantity;
    orderItems.push({ product_id: product.id, quantity: item.quantity, price: product.price });
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("Order")
    .insert({
      user_id: user.id,
      total,
      status: "WAITING_PAYMENT",
      payment_method,
      shipping_address,
    })
    .select()
    .single();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

  const { error: itemsError } = await supabaseAdmin
    .from("OrderItem")
    .insert(orderItems.map((oi) => ({ ...oi, order_id: order.id })));

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

  await supabaseAdmin.from("CartItem").delete().eq("user_id", user.id);

  return NextResponse.json({
    orderId: order.id,
    total,
    payment_method,
    payment_info: PAYMENT_INFO[payment_method],
  });
}
