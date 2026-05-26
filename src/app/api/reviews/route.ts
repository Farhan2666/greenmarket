import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const { data, error } = await supabase
    .from("Review")
    .select("*, user:User!user_id(id, name, avatar_url)")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reviewId, rating, comment } = await request.json();
  if (!reviewId) {
    return NextResponse.json({ error: "reviewId required" }, { status: 400 });
  }

  const { data: review } = await supabase
    .from("Review")
    .select("user_id, product_id")
    .eq("id", reviewId)
    .single();

  if (!review || review.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates: Record<string, any> = {};
  if (rating !== undefined) {
    if (rating < 1 || rating > 5) return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    updates.rating = rating;
  }
  if (comment !== undefined) updates.comment = comment;

  const { data, error } = await supabase
    .from("Review")
    .update(updates)
    .eq("id", reviewId)
    .select("*, user:User!user_id(id, name, avatar_url)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: ratings } = await supabase
    .from("Review")
    .select("rating")
    .eq("product_id", review.product_id);

  if (ratings && ratings.length > 0) {
    const avg = Math.round(ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length * 10) / 10;
    await supabase.from("Product").update({ rating: avg }).eq("id", review.product_id);
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get("reviewId");

  if (!reviewId) {
    return NextResponse.json({ error: "reviewId required" }, { status: 400 });
  }

  const { data: review } = await supabase
    .from("Review")
    .select("user_id, product_id")
    .eq("id", reviewId)
    .single();

  if (!review || review.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("Review")
    .delete()
    .eq("id", reviewId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: ratings } = await supabase
    .from("Review")
    .select("rating")
    .eq("product_id", review.product_id);

  if (ratings && ratings.length > 0) {
    const avg = Math.round(ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length * 10) / 10;
    await supabase.from("Product").update({ rating: avg }).eq("id", review.product_id);
  } else {
    await supabase.from("Product").update({ rating: 0 }).eq("id", review.product_id);
  }

  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { product_id, rating, comment } = await request.json();
  if (!product_id || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("Review")
    .select("id")
    .eq("product_id", product_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Kamu sudah mereview produk ini" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("Review")
    .insert({ product_id, user_id: user.id, rating, comment })
    .select("*, user:User!user_id(id, name, avatar_url)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: ratings } = await supabase
    .from("Review")
    .select("rating")
    .eq("product_id", product_id);

  if (ratings && ratings.length > 0) {
    const avg = Math.round(ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length * 10) / 10;
    await supabase.from("Product").update({ rating: avg }).eq("id", product_id);
  }

  return NextResponse.json(data);
}
