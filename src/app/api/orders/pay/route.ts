import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getAuthenticatedUser } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId, paymentProof } = await request.json();
  if (!orderId || !paymentProof) {
    return NextResponse.json({ error: "orderId and paymentProof required" }, { status: 400 });
  }

  const { data: order } = await supabaseAdmin
    .from("Order")
    .select("user_id, status")
    .eq("id", orderId)
    .single();

  if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  if (order.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (order.status !== "WAITING_PAYMENT") {
    return NextResponse.json({ error: "Pesanan sudah dibayar" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("Order")
    .update({ payment_proof: paymentProof, status: "PAID", paid_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
