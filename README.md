# Website Catsette

Web catalogue của tiệm Catsette, làm bằng [Astro](https://astro.build). Đây là **bước 1**: chỉ giới thiệu sản phẩm, nút "Mua" dẫn sang Shopee hoặc Zalo. Chưa có giỏ hàng, form đặt hàng hay thanh toán online, vì những thứ đó cần thông báo website với Bộ Công Thương (online.gov.vn) trước khi chạy.

## Chạy thử trên máy

```bash
npm install
npm run dev      # mở http://localhost:4321
npm run build    # xuất web tĩnh ra thư mục dist/
```

## Sửa nội dung

Vào **https://www.tiemcatsette.com/admin** để sửa sản phẩm, giá, phân loại, ảnh và thông tin tiệm ngay trên trình duyệt (dùng [Sveltia CMS](https://github.com/sveltia/sveltia-cms)). Mỗi lần bấm Lưu, trang quản lý commit thẳng vào nhánh `main` trên GitHub, Vercel tự build lại web sau khoảng 1 phút.

### Đăng nhập trang quản lý

Trang quản lý đăng nhập bằng GitHub token:

1. Vào https://github.com/settings/personal-access-tokens/new
2. Đặt tên (vd "Catsette CMS"), chọn thời hạn, mục **Repository access** chọn **Only select repositories** rồi chọn `a-website`.
3. Mục **Permissions → Repository permissions**, đặt **Contents** thành **Read and write**.
4. Bấm **Generate token**, copy token.
5. Vào `/admin`, bấm **Đăng nhập bằng mã truy cập** và dán token. Trình duyệt sẽ nhớ, lần sau khỏi nhập. Token hết hạn thì làm lại các bước trên.

### Dữ liệu nằm ở đâu

| Nội dung | File | Trong /admin |
| --- | --- | --- |
| Link Shopee, Zalo, mạng xã hội, câu giới thiệu, thời gian làm hàng, bảo hành | `src/data/site.json` | Thông tin tiệm |
| Mỗi sản phẩm: tên, danh mục, ảnh, link Shopee, nổi bật ở trang chủ, phân loại và giá | `src/data/products/<slug>.json` (tên file là đường dẫn `/san-pham/<slug>`) | Sản phẩm |
| Ảnh tải lên | `public/images/` | Thư viện ảnh |

Cấu hình trang quản lý nằm ở `public/admin/config.yml`.

### Cập nhật sản phẩm từ file Excel

```bash
python3 scripts/import_products.py "đường/dẫn/Catsette_Danh_Sach_San_Pham.xlsx"
```

Script đọc 2 sheet "Sản phẩm có sẵn" và "Làm theo yêu cầu" rồi cập nhật tên, giá và bảng phân loại trong `src/data/products/`, giữ nguyên tên ngắn, ảnh, link Shopee, thứ tự và sản phẩm nổi bật. Giá đã sửa trong /admin sẽ bị Excel ghi đè, nên chỉ dùng một trong hai cách để sửa giá. Cần `pip install openpyxl`.

## Đưa lên mạng

Web là trang tĩnh, đưa lên Vercel hoặc Netlify miễn phí: đăng nhập bằng GitHub, chọn repo này, framework Astro, build command `npm run build`, thư mục `dist`. Tên miền tiemcatsette.com: thêm vào mục Domains của Vercel/Netlify rồi trỏ DNS theo hướng dẫn ở đó. Nếu đổi tên miền, sửa `site` trong `astro.config.mjs`.
