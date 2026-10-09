# Website Catsette

Web catalogue của tiệm Catsette, làm bằng [Astro](https://astro.build). Đây là **bước 1**: chỉ giới thiệu sản phẩm, nút "Mua" dẫn sang Shopee hoặc Zalo. Chưa có giỏ hàng, form đặt hàng hay thanh toán online, vì những thứ đó cần thông báo website với Bộ Công Thương (online.gov.vn) trước khi chạy.

## Chạy thử trên máy

```bash
npm install
npm run dev      # mở http://localhost:4321
npm run build    # xuất web tĩnh ra thư mục dist/
```

## Sửa nội dung

| Muốn sửa | Sửa file |
| --- | --- |
| Link Shopee, Zalo, Facebook, Instagram, TikTok, câu giới thiệu | `src/site.ts` |
| Tên ngắn, sản phẩm nổi bật ở trang chủ, ảnh, link Shopee riêng của từng sản phẩm | `src/data/product-extras.json` |
| Danh sách sản phẩm và bảng giá | chạy lại script bên dưới |

### Cập nhật sản phẩm từ file Excel

```bash
python3 scripts/import_products.py "đường/dẫn/Catsette_Danh_Sach_San_Pham.xlsx"
```

Script đọc 2 sheet "Sản phẩm có sẵn" và "Làm theo yêu cầu" rồi ghi lại `src/data/products.json`. Cần `pip install openpyxl`. Nếu đổi tên sản phẩm trong Excel thì slug đổi theo, nhớ sửa key tương ứng trong `product-extras.json`.

### Thêm ảnh sản phẩm

Bỏ ảnh vào `public/images/` (vd `public/images/moc-khoa-nfc.jpg`) rồi điền `"image": "/images/moc-khoa-nfc.jpg"` cho sản phẩm đó trong `product-extras.json`. Sản phẩm chưa có ảnh sẽ hiện ảnh tạm.

## Đưa lên mạng

Web là trang tĩnh, đưa lên Vercel hoặc Netlify miễn phí: đăng nhập bằng GitHub, chọn repo này, framework Astro, build command `npm run build`, thư mục `dist`. Khi có tên miền, sửa `site` trong `astro.config.mjs`.
