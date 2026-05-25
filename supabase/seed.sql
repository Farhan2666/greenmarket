-- Seed data for GreenMarket
INSERT INTO "User" (id, email, name, role) VALUES
    ('u1', 'techstore@greenmarket.id', 'TechStore Official', 'SELLER'),
    ('u2', 'gadgetzone@greenmarket.id', 'GadgetZone', 'SELLER'),
    ('u3', 'sportify@greenmarket.id', 'Sportify', 'SELLER'),
    ('u4', 'urbangear@greenmarket.id', 'UrbanGear', 'SELLER'),
    ('u5', 'furnicube@greenmarket.id', 'FurniCube', 'SELLER'),
    ('u6', 'streetwear@greenmarket.id', 'StreetWear ID', 'SELLER'),
    ('u7', 'classicwear@greenmarket.id', 'ClassicWear', 'SELLER');

INSERT INTO "Product" (id, name, description, price, images, category, stock, rating, seller_id) VALUES
    ('p1', 'Wireless Headphone Pro', 'Headphone nirkabel dengan noise cancelling aktif, baterai tahan 40 jam, dan suara Hi-Res Audio.', 299000, ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'], 'Elektronik', 50, 48, 'u1'),
    ('p2', 'Smart Watch Ultra', 'Jam tangan pintar dengan AMOLED display, GPS built-in, monitor detak jantung, dan tahan air IP68.', 549000, ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 'https://images.unsplash.com/photo-1546868871-af0de0ae72fb?w=400'], 'Elektronik', 30, 49, 'u2'),
    ('p3', 'Sneakers Air Max', 'Sepatu sneakers dengan teknologi Air Max cushioning, upper mesh breathable, dan outsole karet anti-slip.', 450000, ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400'], 'Sepatu', 75, 47, 'u3'),
    ('p4', 'Premium Backpack', 'Tas ransel premium anti-air dengan kompartemen laptop 15 inch, USB charging port, dan desain ergonomis.', 189000, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=400'], 'Aksesoris', 120, 46, 'u4'),
    ('p5', 'Meja Gaming Minimalis', 'Meja gaming dengan desain minimalis, carbon fiber surface, RGB strip, dan cable management system.', 875000, ARRAY['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400'], 'Rumah', 20, 45, 'u5'),
    ('p6', 'Jaket Hoodie Premium', 'Hoodie premium berbahan cotton fleece 380gsm, sablon timbul, ribbed cuffs, dan hoodie double-layer.', 199000, ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'], 'Fashion', 200, 47, 'u6'),
    ('p7', 'Sepatu Lari Ultralight', 'Sepatu lari dengan teknologi Boost midsole, upper knit yang ringan, dan outsole Continental rubber.', 650000, ARRAY['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400'], 'Olahraga', 45, 48, 'u3'),
    ('p8', 'TWS Earbuds Mini', 'True Wireless Earbuds dengan ukuran mini, ENC noise cancelling, baterai 30 jam, dan IPX5 water resistant.', 159000, ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400'], 'Elektronik', 300, 46, 'u1'),
    ('p9', 'Jam Tangan Klasik', 'Jam tangan analog dengan movement quartz Jepang, stainless steel case, dan leather strap asli.', 350000, ARRAY['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400'], 'Aksesoris', 60, 45, 'u7'),
    ('p10', 'Lampu Meja LED', 'Lampu meja LED dengan adjustable brightness, mode warna RGB, USB charging port, dan desain ergonomis.', 125000, ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed7f5b3e5f?w=400'], 'Rumah', 150, 44, 'u5');
