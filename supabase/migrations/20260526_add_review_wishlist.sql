-- =====================
-- TABEL REVIEW
-- =====================
CREATE TABLE IF NOT EXISTS "Review" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id TEXT NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON "Review" FOR SELECT USING (true);

CREATE POLICY "Users can insert own review"
  ON "Review" FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own review"
  ON "Review" FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own review"
  ON "Review" FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================
-- TABEL WISHLIST
-- =====================
CREATE TABLE IF NOT EXISTS "Wishlist" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE "Wishlist" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wishlist"
  ON "Wishlist" FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own wishlist"
  ON "Wishlist" FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own wishlist"
  ON "Wishlist" FOR DELETE
  USING (auth.uid()::text = user_id);

-- =====================
-- FUNCTION: DECREMENT STOCK (atomic)
-- =====================
CREATE OR REPLACE FUNCTION decrement_stock(product_id TEXT, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE "Product"
  SET stock = stock - amount
  WHERE id = product_id AND stock >= amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stok tidak cukup untuk produk %', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
