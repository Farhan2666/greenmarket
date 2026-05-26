import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function getAuthed(token: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  await supabase.auth.setSession({ access_token: token, refresh_token: "" });
  return { supabase, user };
}

async function recalcRating(supabase: any, product_id: string) {
  const { data: ratings } = await supabase
    .from("Review")
    .select("rating")
    .eq("product_id", product_id);

  if (ratings && ratings.length > 0) {
    const avg = Math.round(ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length * 10) / 10;
    await supabase.from("Product").update({ rating: avg }).eq("id", product_id);
  } else {
    await supabase.from("Product").update({ rating: 0 }).eq("id", product_id);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from("Review")
    .select("*, user:User!user_id(id, name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authed = await getAuthed(token);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { product_id, rating, comment } = await request.json();
  if (!product_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { data: existing } = await authed.supabase
    .from("Review")
    .select("id")
    .eq("product_id", product_id)
    .eq("user_id", authed.user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Kamu sudah mereview produk ini" }, { status: 400 });
  }

  const { data, error } = await authed.supabase
    .from("Review")
    .insert({ product_id, user_id: authed.user.id, rating, comment })
    .select("*, user:User!user_id(id, name, avatar_url)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await recalcRating(authed.supabase, product_id);
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authed = await getAuthed(token);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reviewId, rating, comment } = await request.json();
  if (!reviewId) {
    return NextResponse.json({ error: "reviewId required" }, { status: 400 });
  }

  const { data: review } = await authed.supabase
    .from("Review")
    .select("user_id, product_id")
    .eq("id", reviewId)
    .single();

  if (!review || review.user_id !== authed.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (rating !== undefined && (rating < 1 || rating > 5)) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const updateData: Record<string, any> = {};
  if (rating !== undefined) updateData.rating = rating;
  if (comment !== undefined) updateData.comment = comment;

  const supabase: any = authed.supabase;
  const { data, error } = await supabase
    .from("Review")
    .update(updateData)
    .eq("id", reviewId)
    .select("*, user:User!user_id(id, name, avatar_url)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await recalcRating(authed.supabase, review.product_id);
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const authed = await getAuthed(token);
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get("reviewId");

  if (!reviewId) {
    return NextResponse.json({ error: "reviewId required" }, { status: 400 });
  }

  const { data: review } = await authed.supabase
    .from("Review")
    .select("user_id, product_id")
    .eq("id", reviewId)
    .single();

  if (!review || review.user_id !== authed.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await authed.supabase
    .from("Review")
    .delete()
    .eq("id", reviewId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await recalcRating(authed.supabase, review.product_id);
  return NextResponse.json({ success: true });
}
