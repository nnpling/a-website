import raw from "../data/products.json";
import extras from "../data/product-extras.json";
import { site } from "../site";

type Extra = { shortName?: string; featured?: number; image?: string; shopeeUrl?: string };

export type Variant = { label: string; price: number | null };

export type Product = {
  slug: string;
  name: string;
  shortName: string;
  category: string;
  categorySlug: string;
  type: "ready" | "custom";
  variantCount: number;
  priceMin: number;
  priceMax: number;
  note: string | null;
  variants: Variant[];
  featured?: number;
  image?: string;
  shopeeUrl: string;
};

const extraMap = extras as unknown as Record<string, Extra>;

export const products: Product[] = (raw as Omit<Product, "shortName" | "shopeeUrl">[]).map((p) => {
  const e = extraMap[p.slug] ?? {};
  return {
    ...p,
    variants: p.variants.map((v) => ({ ...v, label: v.label.replace(/\s*,\s*/g, ", ") })),
    shortName: e.shortName || p.name,
    featured: e.featured,
    image: e.image || undefined,
    shopeeUrl: e.shopeeUrl || site.shopeeUrl,
  };
});

// Thứ tự hiển thị danh mục: hàng bán chạy (làm theo yêu cầu) lên trước.
export const categories = [
  { slug: "moc-khoa-nfc", name: "Móc khoá NFC" },
  { slug: "photo-card", name: "Card Spotify" },
  { slug: "card-nfc", name: "Card NFC" },
  { slug: "lyric-card", name: "Lyric card" },
  { slug: "postcard", name: "Postcard" },
  { slug: "poster", name: "Poster" },
  { slug: "sticker", name: "Sticker" },
  { slug: "bookmark", name: "Bookmark" },
  { slug: "phu-kien", name: "Phụ kiện" },
].filter((c) => products.some((p) => p.categorySlug === c.slug));

export const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

export const featuredProducts = products
  .filter((p) => p.featured)
  .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0));

const vnd = (n: number) => n.toLocaleString("vi-VN") + "đ";

export const formatPrice = (p: Pick<Product, "priceMin" | "priceMax">) =>
  p.priceMin === p.priceMax ? vnd(p.priceMin) : `${vnd(p.priceMin)} – ${vnd(p.priceMax)}`;

export const formatVnd = vnd;
