import raw from "../data/products.json";
import extras from "../data/product-extras.json";
import { site } from "../site";

type Extra = {
  shortName?: string;
  featured?: number;
  image?: string;
  shopeeUrl?: string;
  optionNames?: string[];
};

// options: các giá trị phân loại của biến thể, vd ["Khung tròn đĩa CD", "+ móc sao, in 2 mặt"]
export type Variant = { label: string; options: string[]; price: number | null };

export type OptionGroup = { name: string; values: string[] };

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
  optionGroups: OptionGroup[];
  featured?: number;
  image?: string;
  shopeeUrl: string;
};

const extraMap = extras as unknown as Record<string, Extra>;

const DEFAULT_OPTION_NAMES = ["Mẫu", "Tuỳ chọn"];

type RawProduct = Omit<Product, "shortName" | "shopeeUrl" | "optionGroups" | "variants"> & {
  variants: { label: string; price: number | null }[];
};

// Shopee nối các phân loại bằng dấu phẩy không có khoảng trắng phía sau
// ("Khung tròn đĩa CD,+ móc sao, in 2 mặt"), còn dấu phẩy bên trong một phân loại có khoảng trắng.
const splitOptions = (label: string) => label.split(/,(?=\S)/).map((s) => s.trim());

function buildOptionGroups(variants: Variant[], names: string[]): OptionGroup[] {
  const count = Math.max(0, ...variants.map((v) => v.options.length));
  return Array.from({ length: count }, (_, i) => ({
    name: names[i] ?? DEFAULT_OPTION_NAMES[i] ?? `Tuỳ chọn ${i + 1}`,
    values: [...new Set(variants.map((v) => v.options[i]).filter(Boolean))],
  }));
}

export const products: Product[] = (raw as RawProduct[]).map((p) => {
  const e = extraMap[p.slug] ?? {};
  const variants = p.variants.map((v) => {
    const options = splitOptions(v.label);
    return { ...v, options, label: options.join(" · ") };
  });
  return {
    ...p,
    variants,
    optionGroups: buildOptionGroups(variants, e.optionNames ?? []),
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
