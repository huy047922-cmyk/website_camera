# Hướng Dẫn Hướng Triển Khai Website CameraMini.vn Trên Cloudflare

Dự án website bán hàng & độ chế camera **CameraMini.vn** được thiết kế nguyên khối (Fullstack) hỗ trợ triển khai 100% trên nền tảng **Cloudflare**:
- **Frontend & Admin Panel**: Cloudflare Pages / Static Assets.
- **Backend API**: Cloudflare Workers (Sử dụng framework siêu tốc Hono/Worker Router).
- **Database**: Cloudflare D1 (Serverless SQLite toàn cầu).

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
d:\dem_nguoi\cameramini_cf/
├── schema.sql           # File SQL tạo bảng D1 (products, categories, orders, custom_requests, admins)
├── wrangler.toml        # File cấu hình Cloudflare Workers & D1 Binding
├── package.json         # Cấu hình dự án & Lệnh Wrangler
├── src/
│   └── index.js         # Backend API Cloudflare Worker (Phục vụ API Storefront & Admin Dashboard)
└── public/
    ├── index.html       # Giao diện Trang Chủ Bán Hàng & Đặt Hàng Khách Hàng
    ├── admin.html       # Giao diện Trang Quản Trị Admin (Thêm sản phẩm, Quản lý đơn hàng)
    ├── styles.css       # Bộ CSS Giao diện Chuyên nghiệp (Dark Navy / Amber Gold)
    ├── app.js           # Frontend Logic Storefront (Giỏ hàng, Tìm kiếm, Đặt hàng)
    └── admin.js         # Frontend Logic Admin Dashboard (Đăng nhập, Thêm/Xoá sản phẩm D1)
```

---

## 🚀 Các Bước Triển Khai Lên Cloudflare Thực Tế

### Bước 1: Khởi Tạo Cơ Sở Dữ Liệu Cloudflare D1

Mở Terminal tại thư mục `cameramini_cf` và chạy lệnh tạo cơ sở dữ liệu:

```bash
npx wrangler d1 create cameramini_db
```

Sau khi chạy xong, Cloudflare sẽ trả về thông tin `database_id`. Hãy copy `database_id` đó và dán vào file [`wrangler.toml`](file:///d:/dem_nguoi/cameramini_cf/wrangler.toml):

```toml
[[d1_databases]]
binding = "DB"
database_name = "cameramini_db"
database_id = "PASTE_YOUR_DATABASE_ID_HERE"
```

### Bước 2: Khởi Tạo Bảng & Dữ Liệu Mẫu

Chạy lệnh chèn Schema SQL vào D1 Database trên Cloudflare:

```bash
npx wrangler d1 execute cameramini_db --file=./schema.sql
```

### Bước 3: Triển Khai Lên Cloudflare Workers / Pages

Chạy lệnh deploy ứng dụng lên Cloudflare:

```bash
npx wrangler deploy
```

Website của bạn sẽ được kích hoạt trực tuyến trên domain Cloudflare dạng `https://cameramini-cf.<your-subdomain>.workers.dev` với đầy đủ các tính năng:
- **Trang chủ**: `https://cameramini-cf.<your-subdomain>.workers.dev/index.html`
- **Trang Admin**: `https://cameramini-cf.<your-subdomain>.workers.dev/admin.html` (Tài khoản: `admin` / Mật khẩu: `admin123`)

---

## 💻 Chạy Thử Nghiệm Tại Local

Bạn có thể chạy thử trực tiếp trên máy bằng lệnh:

```bash
npx wrangler dev
```

Hoặc đơn giản mở trực tiếp các file [`public/index.html`](file:///d:/dem_nguoi/cameramini_cf/public/index.html) và [`public/admin.html`](file:///d:/dem_nguoi/cameramini_cf/public/admin.html) trên trình duyệt để trải nghiệm toàn bộ giao diện!
