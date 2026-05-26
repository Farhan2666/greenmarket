import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/supabase-server";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "SELLER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("OrderItem")
    .select("*, order:Order(*), product:Product(id, name, images, price)")
    .eq("product.seller_id", user.id)
    .order("order.created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ordersMap = new Map<string, any>();
  for (const oi of data || []) {
    if (!ordersMap.has(oi.order?.id)) {
      ordersMap.set(oi.order?.id, {
        ...oi.order,
        items: [],
        buyer_name: "",
        buyer_phone: "",
        buyer_address: "",
      });
    }
    const entry = ordersMap.get(oi.order?.id);
    entry.items.push(oi);

    if (oi.order?.shipping_address) {
      const addr = oi.order.shipping_address as any;
      entry.buyer_name = addr.name || "";
      entry.buyer_phone = addr.phone || "";
      entry.buyer_address = `${addr.street || ""}, ${addr.city || ""}${addr.pos ? ", " + addr.pos : ""}`;
    }

    if (!entry.buyer && oi.order?.user_id) {
      const { data: buyer } = await supabaseAdmin
        .from("User")
        .select("name, email")
        .eq("id", oi.order.user_id)
        .single();
      entry.buyer = buyer || { name: "Unknown", email: "-" };
    }
  }

  return NextResponse.json(Array.from(ordersMap.values()));
}

export async function PATCH(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("User")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "SELLER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orderId, action } = await request.json();
  if (!orderId || !action) {
    return NextResponse.json({ error: "orderId and action required" }, { status: 400 });
  }

  if (action === "confirm") {
    const { data: items } = await supabaseAdmin
      .from("OrderItem")
      .select("product_id, quantity, product:Product(id, stock, seller_id)")
      .eq("order_id", orderId);

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Order item tidak ditemukan" }, { status: 404 });
    }

    for (const item of items) {
      const prod = item as any;
      const product = prod.product;
      if (product?.seller_id !== user.id) {
        return NextResponse.json({ error: "Bukan produk kamu" }, { status: 403 });
      }
      if ((product?.stock ?? 0) < item.quantity) {
        const { data: prodInfo } = await supabaseAdmin
          .from("Product")
          .select("name")
          .eq("id", item.product_id)
          .single();
        return NextResponse.json({
          error: `Stok "${prodInfo?.name || "Produk"}" tidak mencukupi (sisa ${product?.stock ?? 0}, butuh ${item.quantity})`,
        }, { status: 400 });
      }
    }

    for (const item of items) {
      const prod = item as any;
      await supabaseAdmin
        .from("Product")
        .update({ stock: (prod.product?.stock ?? 0) - item.quantity })
        .eq("id", item.product_id);
    }

    const { error } = await supabaseAdmin
      .from("Order")
      .update({ status: "CONFIRMED" })
      .eq("id", orderId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: "Pesanan dikonfirmasi" });
  }

  if (action === "reject") {
    const { error } = await supabaseAdmin
      .from("Order")
      .update({ status: "CANCELLED" })
      .eq("id", orderId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: "Pesanan ditolak" });
  }

  if (action === "ship") {
    const { error } = await supabaseAdmin
      .from("Order")
      .update({ status: "SHIPPED" })
      .eq("id", orderId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, message: "Pesanan dikirim" });
  }

  return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
}
