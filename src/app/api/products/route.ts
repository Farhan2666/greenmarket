import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/db-products";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const sortBy = searchParams.get("sort") || undefined;

  const products = await getProducts({ search, category, sortBy });

  return NextResponse.json(products);
}
