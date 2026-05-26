import { products as staticProducts } from "./data";
import { supabaseAdmin } from "./supabase-admin";
import type { Product } from "./data";

function mapProduct(p: any): Product {
  return {
    id: typeof p.id === "number" ? p.id : Number(p.id.replace(/\D/g, "")) || Math.random(),
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.images?.[0] || "",
    images: p.images || [],
    category: p.category,
    rating: p.rating ? Math.round(p.rating * 10) / 10 : 0,
    sold: p.sold ?? Math.floor(Math.random() * 1000),
    store: p.seller?.name || p.store || "Toko",
    location: p.location || "Indonesia",
    stock: p.stock || 0,
  };
}

export async function getProducts(options?: {
  search?: string;
  category?: string;
  sortBy?: string;
}): Promise<Product[]> {
  try {
    let query = supabaseAdmin.from("Product").select(`
      id, name, description, price, images, category, stock, rating,
      seller_id, created_at,
      seller:User!seller_id(id, name)
    `);

    if (options?.category) {
      query = query.eq("category", options.category);
    }

    if (options?.search) {
      query = query.or(
        `name.ilike.%${options.search}%,category.ilike.%${options.search}%`
      );
    }

    switch (options?.sortBy) {
      case "termurah":
        query = query.order("price", { ascending: true });
        break;
      case "termahal":
        query = query.order("price", { ascending: false });
        break;
      case "rating":
        query = query.order("rating", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;

    const dbProducts = (data || []).map(mapProduct);

    const dbIds = new Set(dbProducts.map((p) => p.id));
    const staticFiltered = staticProducts.filter((p) => !dbIds.has(p.id));

    if (options?.category) {
      return [...dbProducts, ...staticFiltered.filter((p) => p.category === options.category)];
    }

    return [...dbProducts, ...staticFiltered];
  } catch {
    if (options?.category) {
      return staticProducts.filter((p) => p.category === options.category);
    }
    return staticProducts;
  }
}

function normalizeProductId(id: string): string {
  return id.startsWith("p") ? id : `p${id}`;
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("Product")
      .select(`
        id, name, description, price, images, category, stock, rating,
        seller_id, created_at,
        seller:User!seller_id(id, name)
      `)
      .eq("id", normalizeProductId(id))
      .maybeSingle();

    if (error) throw error;

    if (data) return mapProduct(data);

    const numericId = parseInt(id.replace(/\D/g, ""));
    return staticProducts.find((p) => p.id === numericId) || null;
  } catch {
    const numericId = parseInt(id.replace(/\D/g, ""));
    return staticProducts.find((p) => p.id === numericId) || null;
  }
}
