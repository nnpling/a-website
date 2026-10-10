import { site } from "../site";

// Mỗi sản phẩm là một file trong src/data/products/ (tên file = slug trên web).
// Sửa trong trang quản lý /admin hoặc sửa thẳng file JSON.
type ProductFile = {
  name: string;
  shortName?: string;
  categorySlug: string;
  type: "ready" | "custom";
  // Bật trong /admin để tạm ẩn sản phẩm khỏi web.
  hidden?: boolean;
  order?: number | null;
  featured?: number | null;
  images?: string[];
  // Ảnh riêng của từng phân loại, hiện khi khách bấm chọn phân loại đó.
  optionImages?: { option?: string; image?: string }[];
  image?: string; // kiểu cũ (1 ảnh), vẫn đọc được
  shopeeUrl?: string;
  note?: string;
  // Chỉ dùng cho hàng có sẵn không có bảng phân loại.
  priceMin?: number | null;
  priceMax?: number | null;
  variantCount?: number | null;
  option1Name?: string;
  option2Name?: string;
  variants?: { option1?: string; option2?: string; price?: number | null }[];
};

// options: các giá trị phân loại của biến thể, vd ["Khung tròn đĩa CD", "+ móc sao, in 2 mặt"]
export type Variant = { label: string; options: string[]; price: number | null };

export type OptionGroup = { name: string; values: string[] };

export type Product = {
  slug: string;
  name: string;
  shortName: string;
  categorySlug: string;
  type: "ready" | "custom";
  variantCount: number;
  priceMin: number;
  priceMax: number;
  note: string | null;
  variants: Variant[];
  optionGroups: OptionGroup[];
  featured?: number;
  image?: string; // ảnh đại diện = ảnh đầu tiên
  images: string[];
  optionImages: Record<string, string>;
  shopeeUrl: string;
};

const files = import.meta.glob<ProductFile>("../data/products/*.json", { eager: true, import: "default" });

const DEFAULT_OPTION_NAMES = ["Mẫu", "Tuỳ chọn"];

// Ô số để trống trong trang quản lý có thể lưu thành null hoặc "".
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

function buildOptionGroups(variants: Variant[], names: string[]): OptionGroup[] {
  const count = Math.max(0, ...variants.map((v) => v.options.length));
  return Array.from({ length: count }, (_, i) => ({
    name: names[i] || DEFAULT_OPTION_NAMES[i] || `Tuỳ chọn ${i + 1}`,
    values: [...new Set(variants.map((v) => v.options[i]).filter(Boolean))],
  }));
}

function toProduct(path: string, p: ProductFile): Product {
  const images = (p.images ?? [p.image]).filter((s): s is string => !!s);
  const optionImages = Object.fromEntries(
    (p.optionImages ?? []).filter((o) => o.option?.trim() && o.image).map((o) => [o.option!.trim(), o.image!]),
  );
  const slug = path.split("/").pop()!.replace(/\.json$/, "");
  const variants: Variant[] = (p.variants ?? [])
    .map((v) => {
      const options = [v.option1, v.option2].map((o) => o?.trim() ?? "").filter(Boolean);
      return { options, label: options.join(" · "), price: num(v.price) };
    })
    .filter((v) => v.options.length);
  const prices = variants.map((v) => v.price).filter((n): n is number => n !== null);
  const priceMin = prices.length ? Math.min(...prices) : num(p.priceMin) ?? 0;
  const priceMax = prices.length ? Math.max(...prices) : num(p.priceMax) ?? priceMin;
  return {
    slug,
    name: p.name,
    shortName: p.shortName || p.name,
    categorySlug: p.categorySlug,
    type: p.type,
    variantCount: variants.length || num(p.variantCount) || 1,
    priceMin,
    priceMax: Math.max(priceMin, priceMax),
    note: p.note || null,
    variants,
    optionGroups: buildOptionGroups(variants, [p.option1Name ?? "", p.option2Name ?? ""]),
    featured: num(p.featured) ?? undefined,
    image: images[0],
    images,
    optionImages,
    shopeeUrl: p.shopeeUrl || site.shopeeUrl,
  };
}

export const products: Product[] = Object.entries(files)
  .filter(([, p]) => !p.hidden)
  .map(([path, p]) => ({ order: num(p.order) ?? Infinity, product: toProduct(path, p) }))
  .sort((a, b) => a.order - b.order || a.product.slug.localeCompare(b.product.slug))
  .map((x) => x.product);

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
