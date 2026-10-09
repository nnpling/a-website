"""Chuyển file Catsette_Danh_Sach_San_Pham.xlsx thành src/data/products.json.

Cách dùng:
    python3 scripts/import_products.py duong/dan/Catsette_Danh_Sach_San_Pham.xlsx

Ảnh, link Shopee và sản phẩm nổi bật nằm ở src/data/product-extras.json,
không bị ghi đè khi chạy lại script này.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

import openpyxl

OUT = Path(__file__).resolve().parent.parent / "src" / "data" / "products.json"

CATEGORY_SLUGS = {
    "NFC Keychain": "moc-khoa-nfc",
    "NFC Card": "card-nfc",
    "Photo Card": "photo-card",
    "Lyric Card": "lyric-card",
    "Bookmark": "bookmark",
    "Postcard": "postcard",
    "Poster": "poster",
    "Sticker/Decal": "sticker",
    "Phụ kiện": "phu-kien",
}


def slugify(text: str) -> str:
    text = text.replace("đ", "d").replace("Đ", "D")
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text


def parse_price(value):
    """Trả về (min, max) theo đồng; nhận số hoặc chuỗi kiểu '17.000 – 23.000 đ'."""
    if isinstance(value, (int, float)):
        return int(value), int(value)
    nums = [int(n.replace(".", "")) for n in re.findall(r"\d[\d.]*", str(value or ""))]
    return (min(nums), max(nums)) if nums else (None, None)


def unique_slug(name, used):
    base = slugify(re.sub(r"^\[[^\]]*\]\s*", "", name))
    if len(base) > 50:
        base = base[:50].rsplit("-", 1)[0]
    slug, i = base, 2
    while slug in used:
        slug, i = f"{base}-{i}", i + 1
    used.add(slug)
    return slug


def main(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    products, used = [], set()

    ready, custom = wb.worksheets[0], wb.worksheets[1]

    for cat, name, count, price, note in ready.iter_rows(min_row=5, values_only=True):
        if not name:
            continue
        lo, hi = parse_price(price)
        products.append({
            "slug": unique_slug(name, used),
            "name": name.strip(),
            "category": cat,
            "categorySlug": CATEGORY_SLUGS.get(cat, slugify(cat)),
            "type": "ready",
            "variantCount": count,
            "priceMin": lo,
            "priceMax": hi,
            "note": note,
            "variants": [],
        })

    current = None
    for cat, name, variant, price in custom.iter_rows(min_row=5, values_only=True):
        if name:
            current = {
                "slug": unique_slug(name, used),
                "name": name.strip(),
                "category": cat,
                "categorySlug": CATEGORY_SLUGS.get(cat, slugify(cat)),
                "type": "custom",
                "variants": [],
            }
            products.append(current)
        if current is not None and variant:
            current["variants"].append({"label": str(variant).strip(), "price": parse_price(price)[0]})

    for p in products:
        if p["type"] == "custom":
            prices = [v["price"] for v in p["variants"] if v["price"]]
            p["variantCount"] = len(p["variants"])
            p["priceMin"], p["priceMax"] = min(prices), max(prices)
            p["note"] = None

    OUT.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Đã ghi {len(products)} sản phẩm vào {OUT}")


if __name__ == "__main__":
    main(sys.argv[1])
