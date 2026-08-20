import { randomUUID as uuid } from 'crypto';
import * as bcryptjs from 'bcryptjs';

// ── Types ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  customerType: 'retail' | 'wholesale';
  avatar?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  categoryId: string;
  category: string;
  fabric: string;
  occasion: string;
  color: string;
  work: string;
  pricing: { retail: number; wholesale: number; mrp: number };
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  address: Address;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
}

// ── Sample Images (placeholder URLs) ────────────────────────────────

const IMG = {
  saree: (n: number) => `https://picsum.photos/seed/saree${n}/600/800`,
  cat: (n: number) => `https://picsum.photos/seed/cat${n}/400/400`,
  banner: (n: number) => `https://picsum.photos/seed/banner${n}/800/400`,
};

// ── Seed Data ───────────────────────────────────────────────────────

const categories: Category[] = [
  { id: 'cat-1', name: 'Banarasi Silk', slug: 'banarasi-silk', image: IMG.cat(1), productCount: 12 },
  { id: 'cat-2', name: 'Kanjivaram', slug: 'kanjivaram', image: IMG.cat(2), productCount: 10 },
  { id: 'cat-3', name: 'Chanderi', slug: 'chanderi', image: IMG.cat(3), productCount: 8 },
  { id: 'cat-4', name: 'Tussar Silk', slug: 'tussar-silk', image: IMG.cat(4), productCount: 6 },
  { id: 'cat-5', name: 'Cotton Saree', slug: 'cotton-saree', image: IMG.cat(5), productCount: 15 },
  { id: 'cat-6', name: 'Georgette', slug: 'georgette', image: IMG.cat(6), productCount: 9 },
  { id: 'cat-7', name: 'Chiffon', slug: 'chiffon', image: IMG.cat(7), productCount: 7 },
  { id: 'cat-8', name: 'Patola', slug: 'patola', image: IMG.cat(8), productCount: 5 },
];

function makeSarees(): Product[] {
  const sarees: Product[] = [];
  const fabrics = ['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Tussar', 'Organza'];
  const occasions = ['Wedding', 'Party', 'Festive', 'Casual', 'Office', 'Bridal'];
  const colors = ['Red', 'Blue', 'Green', 'Pink', 'Yellow', 'Purple', 'Maroon', 'Gold', 'Orange', 'Teal'];
  const works = ['Zari', 'Embroidery', 'Print', 'Handloom', 'Block Print', 'Kalamkari'];
  const names = [
    'Royal Banarasi Wedding Saree', 'Elegant Kanjivaram Silk', 'Classic Chanderi Cotton',
    'Pure Tussar Silk Handloom', 'Designer Georgette Party Wear', 'Festive Organza Saree',
    'Bridal Heavy Zari Work', 'Lightweight Chiffon Daily Wear', 'Traditional Patola Double Ikat',
    'Modern Printed Cotton Saree', 'Golden Border Silk Saree', 'Embroidered Net Saree',
    'Handwoven Maheshwari Silk', 'Designer Sequin Party Saree', 'Temple Border Kanjivaram',
    'Kalamkari Print Cotton', 'Bandhani Tie-Dye Georgette', 'Paithani Silk Traditional',
    'Mysore Crepe Silk Saree', 'Lucknowi Chikankari Saree', 'Pochampalli Ikat Saree',
    'Sambalpuri Cotton Saree', 'Bhagalpuri Tussar Silk', 'Uppada Jamdani Saree',
    'Venkatagiri Cotton Saree', 'Gadwal Silk Saree', 'Narayanpet Cotton Saree',
    'Maheshwari Silk Cotton', 'Bomkai Silk Saree', 'Tant Cotton Bengal Saree',
  ];

  for (let i = 0; i < 30; i++) {
    const catIdx = i % categories.length;
    const retailPrice = 1500 + Math.floor(Math.random() * 8000);
    sarees.push({
      id: `prod-${i + 1}`,
      name: names[i],
      slug: names[i].toLowerCase().replace(/\s+/g, '-'),
      description: `Beautiful ${names[i]} crafted with finest materials. Perfect for ${occasions[i % occasions.length].toLowerCase()} occasions. Features exquisite ${works[i % works.length].toLowerCase()} work with rich ${colors[i % colors.length].toLowerCase()} tones. Comes with matching blouse piece.`,
      images: [IMG.saree(i * 3 + 1), IMG.saree(i * 3 + 2), IMG.saree(i * 3 + 3)],
      categoryId: categories[catIdx].id,
      category: categories[catIdx].name,
      fabric: fabrics[i % fabrics.length],
      occasion: occasions[i % occasions.length],
      color: colors[i % colors.length],
      work: works[i % works.length],
      pricing: {
        retail: retailPrice,
        wholesale: Math.floor(retailPrice * 0.65),
        mrp: Math.floor(retailPrice * 1.4),
      },
      stock: 5 + Math.floor(Math.random() * 50),
      rating: 3.5 + Math.random() * 1.5,
      reviewCount: Math.floor(Math.random() * 50),
      isFeatured: i < 8,
      isNewArrival: i >= 22,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    });
  }
  return sarees;
}

const banners: Banner[] = [
  { id: 'b1', title: 'Wedding Collection', subtitle: 'Up to 30% Off', image: IMG.banner(1), link: '/shop?occasion=Wedding' },
  { id: 'b2', title: 'New Arrivals', subtitle: 'Fresh Designs Every Week', image: IMG.banner(2), link: '/shop?sort=newest' },
  { id: 'b3', title: 'Festive Season Sale', subtitle: 'Starting ₹999', image: IMG.banner(3), link: '/shop?sort=price_asc' },
];

// ── In-Memory Store ─────────────────────────────────────────────────

class Store {
  users: User[] = [];
  products: Product[] = makeSarees();
  categories: Category[] = categories;
  carts: Map<string, CartItem[]> = new Map();
  wishlists: Map<string, string[]> = new Map();
  addresses: Map<string, Address[]> = new Map();
  orders: Order[] = [];
  reviews: Review[] = [];
  banners: Banner[] = banners;
  otpStore: Map<string, string> = new Map(); // email -> otp
  refreshTokens: Map<string, string> = new Map(); // userId -> refreshToken

  constructor() {
    // Seed a demo user
    const hash = bcryptjs.hashSync('password123', 10);
    this.users.push({
      id: 'user-demo',
      name: 'Demo User',
      email: 'demo@matacreations.com',
      phone: '9876543210',
      password: hash,
      customerType: 'retail',
      createdAt: new Date().toISOString(),
    });

    // Seed some reviews
    for (let i = 0; i < 10; i++) {
      this.reviews.push({
        id: `rev-${i + 1}`,
        productId: `prod-${(i % 5) + 1}`,
        userId: 'user-demo',
        userName: 'Happy Customer',
        rating: 4 + Math.random(),
        comment: 'Beautiful saree! The fabric quality is excellent and the colors are vibrant. Very happy with my purchase.',
        createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
      });
    }
  }
}

export const store = new Store();
