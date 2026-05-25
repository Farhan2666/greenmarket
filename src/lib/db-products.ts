import { products as staticProducts } from "./data";
import { supabaseAdmin } from "./supabase-admin";
import type { Product } from "./data";

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
      query = query.ilike("name", `%${options.search}%`);
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

    if (!data || data.length === 0) {
      return staticProducts;
    }

    return data.map((p: any) => ({
      id: Number(p.id.replace(/\D/g, "")) || Math.random(),
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.images?.[0] || "",
      images: p.images || [],
      category: p.category,
      rating: p.rating ? Math.round(p.rating * 10) / 10 : 0,
      sold: Math.floor(Math.random() * 1000),
      store: p.seller?.name || "Toko",
      location: "Indonesia",
      stock: p.stock || 0,
    }));
  } catch {
    return staticProducts;
  }
}

export async function getProduct(id: number): Promise<Product | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("Product")
      .select(`
        id, name, description, price, images, category, stock, rating,
        seller_id, created_at,
        seller:User!seller_id(id, name)
      `)
      .eq("id", `p${id}`)
      .single();

    if (error) throw error;

    if (!data) {
      return staticProducts.find((p) => p.id === id) || null;
    }

    return {
      id: Number(data.id.replace(/\D/g, "")) || id,
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.images?.[0] || "",
      images: data.images || [],
      category: data.category,
      rating: data.rating ? Math.round(data.rating * 10) / 10 : 0,
      sold: Math.floor(Math.random() * 1000),
      store: (data as any).seller?.name || "Toko",
      location: "Indonesia",
      stock: data.stock || 0,
    };
  } catch {
    return staticProducts.find((p) => p.id === id) || null;
  }
}
