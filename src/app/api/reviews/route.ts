import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function authedSupabase(token: string) {
  const sb = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error } = await sb.auth.getUser(token);
  if (error || !user) return null;
  await sb.auth.setSession({ access_token: token, refresh_token: "" });
  return { sb, user };
}

async function recalcRating(sb: any, productId: string) {
  const { data: ratings } = await sb
    .from("Review")
    .select("rating")
    .eq("product_id", productId);

  const avg = ratings?.length
    ? Math.round(ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length * 10) / 10
    : 0;

  await sb.from("Product").update({ rating: avg }).eq("id", productId);
}

function bearerToken(req: Request): string | null {
  const h = req.headers.get("Authorization");
  return h?.startsWith("Bearer ") ? h.slice(7) : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const sb = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await sb
    .from("Review")
    .select("*, user:User!user_id(id, name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const token = bearerToken(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authed = await authedSupabase(token);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { product_id, rating, comment } = await request.json();
  if (!product_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { data: existing } = await authed.sb
    .from("Review")
    .select("id")
    .eq("product_id", product_id)
    .eq("user_id", authed.user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Kamu sudah mereview produk ini" }, { status: 409 });
  }

  const { data, error } = await authed.sb
    .from("Review")
    .insert({ product_id, user_id: authed.user.id, rating, comment })
    .select("*, user:User!user_id(id, name, avatar_url)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await recalcRating(authed.sb, product_id);
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const token = bearerToken(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authed = await authedSupabase(token);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reviewId, rating, comment } = await request.json();
  if (!reviewId) {
    return NextResponse.json({ error: "reviewId required" }, { status: 400 });
  }
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    return NextResponse.json({ error: "rating must be 1-5" }, { status: 400 });
  }

  const { data: review } = await authed.sb
    .from("Review")
    .select("user_id, product_id")
    .eq("id", reviewId)
    .single();

  if (!review || review.user_id !== authed.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload: Record<string, unknown> = {};
  if (rating !== undefined) payload.rating = rating;
  if (comment !== undefined) payload.comment = comment;

  const { data, error } = await (authed.sb as any)
    .from("Review")
    .update(payload)
    .eq("id", reviewId)
    .select("*, user:User!user_id(id, name, avatar_url)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await recalcRating(authed.sb, review.product_id);
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const token = bearerToken(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authed = await authedSupabase(token);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get("reviewId");
  if (!reviewId) {
    return NextResponse.json({ error: "reviewId required" }, { status: 400 });
  }

  const { data: review } = await authed.sb
    .from("Review")
    .select("user_id, product_id")
    .eq("id", reviewId)
    .single();

  if (!review || review.user_id !== authed.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await (authed.sb as any)
    .from("Review")
    .delete()
    .eq("id", reviewId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await recalcRating(authed.sb, review.product_id);
  return NextResponse.json({ success: true });
}
