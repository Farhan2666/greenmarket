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
    .maybeSingle();

  if (!profile || profile.role !== "SELLER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [productsRes, ordersRes] = await Promise.all([
    supabaseAdmin.from("Product").select("id, name, price, stock, images, created_at").eq("seller_id", user.id),
    supabaseAdmin.from("OrderItem").select("*, order:Order(id, status, total, created_at), product:Product(id, name)").eq("product.seller_id", user.id),
  ]);

  const products = productsRes.data || [];
  const orderItems = ordersRes.data || [];

  const revenue = orderItems
    .filter((oi: any) => oi.order?.status === "DELIVERED")
    .reduce((sum: number, oi: any) => sum + (oi.price * oi.quantity), 0);

  const activeOrders = new Set(
    orderItems
      .filter((oi: any) => !["DELIVERED", "CANCELLED"].includes(oi.order?.status))
      .map((oi: any) => oi.order?.id)
  );

  const totalOrders = new Set(orderItems.map((oi: any) => oi.order?.id));

  return NextResponse.json({
    revenue,
    productsCount: products.length,
    ordersCount: totalOrders.size,
    activeOrdersCount: activeOrders.size,
    products,
    recentOrders: Array.from(new Map(orderItems.slice(-5).map((oi: any) => [oi.order?.id, oi])).values()),
  });
}
