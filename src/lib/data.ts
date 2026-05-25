export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  rating: number;
  sold: number;
  store: string;
  location: string;
  stock: number;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Wireless Headphone Pro",
    description: "Headphone nirkabel dengan noise cancelling aktif, baterai tahan 40 jam, dan suara Hi-Res Audio. Cocok untuk kerja, gaming, dan traveling.",
    price: 299000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600",
    ],
    category: "Elektronik",
    rating: 4.8,
    sold: 1523,
    store: "TechStore Official",
    location: "Jakarta",
    stock: 50,
  },
  {
    id: 2,
    name: "Smart Watch Ultra",
    description: "Jam tangan pintar dengan AMOLED display, GPS built-in, monitor detak jantung, dan tahan air IP68.",
    price: 549000,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      "https://images.unsplash.com/photo-1546868871-af0de0ae72fb?w=600",
    ],
    category: "Elektronik",
    rating: 4.9,
    sold: 892,
    store: "GadgetZone",
    location: "Bandung",
    stock: 30,
  },
  {
    id: 3,
    name: "Sneakers Air Max",
    description: "Sepatu sneakers dengan teknologi Air Max cushioning, upper mesh breathable, dan outsole karet anti-slip.",
    price: 450000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600",
    ],
    category: "Sepatu",
    rating: 4.7,
    sold: 2100,
    store: "Sportify",
    location: "Tanggerang",
    stock: 75,
  },
  {
    id: 4,
    name: "Premium Backpack",
    description: "Tas ransel premium anti-air dengan kompartemen laptop 15 inch, USB charging port, dan desain ergonomis.",
    price: 189000,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
      "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600",
    ],
    category: "Aksesoris",
    rating: 4.6,
    sold: 3450,
    store: "UrbanGear",
    location: "Jakarta",
    stock: 120,
  },
  {
    id: 5,
    name: "Meja Gaming Minimalis",
    description: "Meja gaming dengan desain minimalis, carbon fiber surface, RGB strip, dan cable management system.",
    price: 875000,
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400",
    images: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600",
    ],
    category: "Rumah",
    rating: 4.5,
    sold: 567,
    store: "FurniCube",
    location: "Surabaya",
    stock: 20,
  },
  {
    id: 6,
    name: "Jaket Hoodie Premium",
    description: "Hoodie premium berbahan cotton fleece 380gsm, sablon timbul, ribbed cuffs, dan hoodie double-layer.",
    price: 199000,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600",
    ],
    category: "Fashion",
    rating: 4.7,
    sold: 5678,
    store: "StreetWear ID",
    location: "Jakarta",
    stock: 200,
  },
  {
    id: 7,
    name: "Sepatu Lari Ultralight",
    description: "Sepatu lari dengan teknologi Boost midsole, upper knit yang ringan, dan outsole Continental rubber.",
    price: 650000,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600",
    ],
    category: "Olahraga",
    rating: 4.8,
    sold: 1234,
    store: "Sportify",
    location: "Bandung",
    stock: 45,
  },
  {
    id: 8,
    name: "TWS Earbuds Mini",
    description: "True Wireless Earbuds dengan ukuran mini, ENC noise cancelling, baterai 30 jam, dan IPX5 water resistant.",
    price: 159000,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=600",
    ],
    category: "Elektronik",
    rating: 4.6,
    sold: 9876,
    store: "TechStore Official",
    location: "Jakarta",
    stock: 300,
  },
  {
    id: 9,
    name: "Jam Tangan Klasik",
    description: "Jam tangan analog dengan movement quartz Jepang, stainless steel case, dan leather strap asli.",
    price: 350000,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600",
    ],
    category: "Aksesoris",
    rating: 4.5,
    sold: 2345,
    store: "ClassicWear",
    location: "Yogyakarta",
    stock: 60,
  },
  {
    id: 10,
    name: "Lampu Meja LED",
    description: "Lampu meja LED dengan adjustable brightness, mode warna RGB, USB charging port, dan desain ergonomis.",
    price: 125000,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed7f5b3e5f?w=400",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed7f5b3e5f?w=600",
    ],
    category: "Rumah",
    rating: 4.4,
    sold: 4567,
    store: "FurniCube",
    location: "Surabaya",
    stock: 150,
  },
];

export const categories = [
  { name: "Elektronik", icon: "📱", count: 3 },
  { name: "Fashion", icon: "👕", count: 1 },
  { name: "Sepatu", icon: "👟", count: 1 },
  { name: "Aksesoris", icon: "⌚", count: 2 },
  { name: "Rumah", icon: "🏠", count: 2 },
  { name: "Olahraga", icon: "⚽", count: 1 },
];
