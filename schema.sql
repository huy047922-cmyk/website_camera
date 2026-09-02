-- Schema for Cloudflare D1 Database (CameraMini.vn)

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT NOT NULL,
    price INTEGER NOT NULL,
    original_price INTEGER,
    badge TEXT,
    badge_type TEXT,
    rating REAL DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    specs_json TEXT, -- JSON string containing resolution, battery, etc.
    featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    note TEXT,
    items_json TEXT NOT NULL, -- JSON array of items [{id, name, price, quantity}]
    total_amount INTEGER NOT NULL,
    payment_method TEXT DEFAULT 'COD',
    status TEXT DEFAULT 'CHO_XAC_NHAN', -- CHO_XAC_NHAN, DA_XAC_NHAN, DANG_GIAO, HOAN_THANH, HUY
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS custom_requests (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    target_item TEXT NOT NULL,
    resolution TEXT NOT NULL,
    battery_type TEXT NOT NULL,
    note TEXT,
    estimated_price INTEGER,
    status TEXT DEFAULT 'CHO_TIEP_NHAN',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initial Categories Seed Data
INSERT OR IGNORE INTO categories (id, name, description) VALUES
('sieu-nho', 'Camera Siêu Nhỏ', 'Các dòng camera kích thước cực nhỏ kết nối Wi-Fi xem từ xa'),
('nguy-trang', 'Camera Ngụy Trang', 'Camera giấu kín dạng đồ vật: ổ điện, sạc dự phòng, đồng hồ, bút...'),
('do-che', 'Camera Độ Chế', 'Thiết bị camera độ chế theo kích thước và vật dụng tùy chọn'),
('dinh-vi', 'Máy Dò & Định Vị', 'Máy phát hiện camera giấu kín và máy dò sóng GSM/GPS');

-- Initial Products Seed Data
INSERT OR IGNORE INTO products (id, name, category_id, price, original_price, badge, badge_type, rating, reviews_count, image, description, specs_json, featured) VALUES
(
    'cam-v99-4k', 
    'Camera Siêu Nhỏ V99 Dây Dù HD 4K Wi-Fi', 
    'sieu-nho', 
    1250000, 
    1650000, 
    'BÁN CHẠY', 
    'hot', 
    4.9, 
    128, 
    'https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=600&q=80', 
    'Camera V99 phiên bản nâng cấp dây dù siêu bền, mắt kính 4K siêu nét, góc quay 150 độ, hỗ trợ quay đêm hồng ngoại ẩn không phát sáng.', 
    '{"resolution":"Ultra HD 4K / 1080P","battery":"4000mAh (Quay 8-10 tiếng)","connection":"Wi-Fi Xem xa qua App LookCam","storage":"Thẻ nhớ 128GB","nightVision":"Hồng ngoại ẩn 940nm"}', 
    1
),
(
    'cam-ocam-dien', 
    'Camera Ngụy Trang Ổ Cắm Điện Lioa Âm Tường', 
    'nguy-trang', 
    1850000, 
    2300000, 
    'ĐỘ CHẾ HOT', 
    'special', 
    5.0, 
    94, 
    'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=600&q=80', 
    'Thiết kế ngụy trang tinh vi trong ổ cắm điện thực tế. Vừa cắm điện gia dụng 220V bình thường vừa quay phim 24/7 không lo hết pin.', 
    '{"resolution":"Full HD 1080P / 2K","battery":"Nguồn điện trực tiếp 220V (Quay 24/7)","connection":"Wi-Fi xem từ xa 4G/5G qua điện thoại","storage":"Thẻ nhớ 64GB kèm theo","nightVision":"Tự động cân bằng sáng"}', 
    1
),
(
    'cam-sac-du-phong', 
    'Camera Ngụy Trang Sạc Dự Phòng 10.000mAh S100', 
    'nguy-trang', 
    1450000, 
    1900000, 
    'GIẢM 24%', 
    'sale', 
    4.8, 
    76, 
    'https://images.unsplash.com/photo-1609592807688-660c23173e6b?auto=format&fit=crop&w=600&q=80', 
    'Kiểu dáng sạc dự phòng nhôm nguyên khối sang trọng, ngụy trang tuyệt đối. Tích hợp sạc nhanh cho điện thoại và camera giấu kín góc rộng.', 
    '{"resolution":"4K Quad HD","battery":"10.000mAh (Quay 15-18 tiếng)","connection":"Wi-Fi P2P / Xem xa qua App","storage":"Thẻ nhớ 128GB","nightVision":"4 Đèn hồng ngoại ẩn"}', 
    1
),
(
    'cam-dong-ho-de-ban', 
    'Camera Đồng Hồ Để Bàn Điện Tử Nhìn Đêm T12', 
    'nguy-trang', 
    1350000, 
    1700000, 
    'MỚI 2026', 
    'new', 
    4.7, 
    52, 
    'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=600&q=80', 
    'Đồng hồ hiển thị giờ, nhiệt độ và báo thức chuẩn xác. Mắt camera giấu sau mặt kính tráng gương đen hoàn toàn ẩn vô hình.', 
    '{"resolution":"1080P Full HD","battery":"Pin sạc + Cắm sạc liên tục","connection":"Kết nối Wi-Fi xem từ xa","storage":"Thẻ nhớ MicroSD 128GB","nightVision":"Cảm biến hồng ngoại quay đêm nét"}', 
    0
),
(
    'cam-a9-mini', 
    'Camera Mini A9 Cắm Thẻ Nhớ Wi-Fi Giá Rẻ', 
    'sieu-nho', 
    490000, 
    750000, 
    'GIÁ TỐT', 
    'sale', 
    4.5, 
    310, 
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80', 
    'Camera mini giá rẻ bán chạy nhất, kích thước đường kính chỉ 4cm, có đế nam hít tiện lợi gắn mọi bề mặt kim loại.', 
    '{"resolution":"HD 1080P","battery":"Pin tích hợp 60 phút","connection":"Wi-Fi HDWiFiCamPro","storage":"Thẻ nhớ TF tối đa 64GB","nightVision":"6 Đèn hồng ngoại LED"}', 
    1
),
(
    'may-phat-hien-k18', 
    'Máy Phát Hiện Camera Giấu Kín & Định Vị K18 Pro', 
    'dinh-vi', 
    1150000, 
    1500000, 
    'KHUYÊN DÙNG', 
    'hot', 
    4.9, 
    204, 
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80', 
    'Thiết bị dò quét đa năng phát hiện các loại camera ẩn, máy nghe lén, máy định vị GPS gắn trên xe hơi hay trong phòng khách sạn.', 
    '{"resolution":"Tần số dò 1MHz - 6.5GHz","battery":"Pin 1000mAh dùng 6-8 tiếng","connection":"Cảm biến sóng RF + Ống kính Laser","storage":"N/A","nightVision":"Đèn LED quét thấu kính"}', 
    1
);

-- Seed Default Admin Account (Username: admin, Password: admin123 - pre-hashed SHA-256 for demo)
INSERT OR IGNORE INTO admins (id, username, password_hash, name) VALUES
('admin-1', 'admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'Quản Trị Viên');
