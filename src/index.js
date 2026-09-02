/**
 * Cloudflare Worker API + Asset Handler for CameraMini.vn
 */

// In-Memory Fallback Store (for quick preview/local testing before D1 deployment)
const memoryStore = {
    users: [
        {
            id: "user-admin",
            full_name: "Quản Trị Viên KBVISION",
            username: "admin",
            password: "123",
            email: "admin@kbvision.vn",
            phone: "0797777071",
            role: "admin",
            created_at: new Date().toISOString()
        },
        {
            id: "user-demo1",
            full_name: "Nguyễn Văn Hùng",
            username: "hungnv",
            password: "123",
            email: "hungnv@gmail.com",
            phone: "0912345678",
            role: "user",
            created_at: new Date().toISOString()
        }
    ],
    news: [
        {
            id: "news-001",
            title: "KBVISION Ra Mắt Dòng Camera AI Full-Color Ban Đêm Có Màu Siêu Nét",
            summary: "Công nghệ thấu kính khẩu độ lớn F1.0 kết hợp trí tuệ nhân tạo AI phân biệt chính xác người và vật, hạn chế 99% báo động giả.",
            content: "Nhà sản xuất KBVISION vừa công bố dòng camera quan sát mới tích hợp chip AI thông minh...",
            image: "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=600&q=80",
            category: "Tin Khuyến Mãi",
            created_at: new Date().toISOString()
        },
        {
            id: "news-002",
            title: "Hướng Dẫn Chọn Camera Giám Sát Phù Hợp Cho Gia Đình & Nhà Xưởng",
            summary: "Các tiêu chí quan trọng khi lắp đặt hệ thống camera: Độ phân giải 4K, tiêu chuẩn vỏ chống nước IP67 và thời gian lưu trữ ổ cứng.",
            content: "Để lựa chọn được hệ thống camera giám sát tối ưu nhất cho diện tích sử dụng...",
            image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
            category: "Tư Vấn Chọn Mua",
            created_at: new Date().toISOString()
        },
        {
            id: "news-003",
            title: "Top 5 Mẫu Camera Wi-Fi KBVISION Xoay 360 Độ Đáng Mua Nhất",
            summary: "Đánh giá chi tiết các dòng camera Wi-Fi không dây đàm thoại 2 chiều, báo động âm thanh còi hú khi phát hiện xâm nhập trái phép.",
            content: "Tổng hợp 5 mẫu camera Wi-Fi xoay 360 độ bán chạy nhất tại KBVISION.vn...",
            image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
            category: "Công Nghệ AI",
            created_at: new Date().toISOString()
        },
        {
            id: "news-004",
            title: "Chương Trình Ưu Đãi Giảm 30% Bộ Kit Camera Trọn Gói Tận Nơi",
            summary: "Áp dụng trọn gói bộ 2, 4, 8 camera KBVISION chính hãng bảo hành 24 tháng 1 đổi 1 tận nơi toàn quốc.",
            content: "Khuyến mãi lớn nhất trong năm từ thương hiệu camera KBVISION USA...",
            image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80",
            category: "Ưu Đãi Lắp Đặt",
            created_at: new Date().toISOString()
        }
    ],
    orders: [],
    customRequests: [],
    categories: [
        {
                "id": "camera-ip",
                "name": "Camera IP KBVISION 4K",
                "description": "Các dòng Camera IP KBVISION độ nét 2MP - 8MP 4K, Wi-Fi, Full-Color có màu đêm"
        },
        {
                "id": "camera-analog",
                "name": "Camera HD-CVI KBVISION",
                "description": "Camera Analog HD-CVI KBVISION vỏ kim loại ngoài trời chống nước IP67"
        },
        {
                "id": "dau-ghi",
                "name": "Đầu Ghi Hình KBVISION",
                "description": "Đầu ghi hình DVR / NVR KBVISION 4/8/16/32 Kênh chuẩn nén H.265+"
        },
        {
                "id": "bo-tron-goi",
                "name": "Bộ Kit Trọn Gói KBVISION",
                "description": "Bộ Kit 2/4/8 Camera KBVISION kèm đầu ghi hình + ổ cứng + công lắp đặt"
        }
],
    products: [
    {
        "id": "cam-p001",
        "name": "Camera Siêu Nhỏ V99 4K Wi-Fi Dây Ruy Băng",
        "category_id": "sieu-nho",
        "price": 1250000,
        "original_price": 1650000,
        "badge": "BÁN CHẠY #1",
        "badge_type": "hot",
        "rating": "4.7",
        "reviews_count": 35,
        "image": "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Siêu Nhỏ V99 4K Wi-Fi Dây Ruy Băng chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 1,
        "created_at": "2026-09-02T07:56:08.950Z"
    },
    {
        "id": "cam-p002",
        "name": "Camera Siêu Nhỏ NV99 4K Xem Từ Xa Pin 15H",
        "category_id": "sieu-nho",
        "price": 1450000,
        "original_price": 1850000,
        "badge": "PIN TRÂU",
        "badge_type": "sale",
        "rating": "4.8",
        "reviews_count": 42,
        "image": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Siêu Nhỏ NV99 4K Xem Từ Xa Pin 15H chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 1,
        "created_at": "2026-09-02T06:56:08.951Z"
    },
    {
        "id": "cam-p003",
        "name": "Camera Siêu Nhỏ S09 Mắt Cúc Áo Giấu Kín",
        "category_id": "sieu-nho",
        "price": 1350000,
        "original_price": 1700000,
        "badge": "GIẤU KÍN 100%",
        "badge_type": "new",
        "rating": "4.9",
        "reviews_count": 49,
        "image": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Siêu Nhỏ S09 Mắt Cúc Áo Giấu Kín chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 1,
        "created_at": "2026-09-02T05:56:08.951Z"
    },
    {
        "id": "cam-p004",
        "name": "Camera Mini A9 Wi-Fi 1080P Góc Quay 150 Độ",
        "category_id": "sieu-nho",
        "price": 490000,
        "original_price": 750000,
        "badge": "GIÁ TỐT",
        "badge_type": "hot",
        "rating": "5.0",
        "reviews_count": 56,
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Mini A9 Wi-Fi 1080P Góc Quay 150 Độ chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 1,
        "created_at": "2026-09-02T04:56:08.951Z"
    },
    {
        "id": "cam-p005",
        "name": "Camera Mini SQ11 Siêu Nhỏ Khối Vuông 2cm",
        "category_id": "sieu-nho",
        "price": 380000,
        "original_price": 550000,
        "badge": "SIÊU NHỎ",
        "badge_type": "sale",
        "rating": "4.7",
        "reviews_count": 63,
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Mini SQ11 Siêu Nhỏ Khối Vuông 2cm chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 1,
        "created_at": "2026-09-02T03:56:08.951Z"
    },
    {
        "id": "cam-p006",
        "name": "Camera Mini SQ13 Wi-Fi Chống Nước Quay Đêm",
        "category_id": "sieu-nho",
        "price": 680000,
        "original_price": 950000,
        "badge": "CHỐNG NƯỚC",
        "badge_type": "new",
        "rating": "4.8",
        "reviews_count": 70,
        "image": "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Mini SQ13 Wi-Fi Chống Nước Quay Đêm chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 1,
        "created_at": "2026-09-02T02:56:08.951Z"
    },
    {
        "id": "cam-p007",
        "name": "Camera Siêu Nhỏ V100 4K Dây Cáp Dài 20cm",
        "category_id": "sieu-nho",
        "price": 1550000,
        "original_price": 1950000,
        "badge": "MỚI 2026",
        "badge_type": "hot",
        "rating": "4.9",
        "reviews_count": 77,
        "image": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Siêu Nhỏ V100 4K Dây Cáp Dài 20cm chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 1,
        "created_at": "2026-09-02T01:56:08.951Z"
    },
    {
        "id": "cam-p008",
        "name": "Camera Mini H6 Wi-Fi Quay Đêm Không Ánh Đỏ",
        "category_id": "sieu-nho",
        "price": 890000,
        "original_price": 1200000,
        "badge": "HỒNG NGOẠI ẨN",
        "badge_type": "sale",
        "rating": "5.0",
        "reviews_count": 84,
        "image": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Mini H6 Wi-Fi Quay Đêm Không Ánh Đỏ chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 1,
        "created_at": "2026-09-02T00:56:08.951Z"
    },
    {
        "id": "cam-p009",
        "name": "Camera Mini H9 Ultra HD 4K Nam Châm Hít Tường",
        "category_id": "sieu-nho",
        "price": 1150000,
        "original_price": 1500000,
        "badge": "NAM CHÂM",
        "badge_type": "new",
        "rating": "4.7",
        "reviews_count": 91,
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Mini H9 Ultra HD 4K Nam Châm Hít Tường chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 1,
        "created_at": "2026-09-01T23:56:08.951Z"
    },
    {
        "id": "cam-p010",
        "name": "Camera Cắm Nhỏ T189 Dạng Bút Cài Túi Áo Full HD",
        "category_id": "sieu-nho",
        "price": 650000,
        "original_price": 900000,
        "badge": "CÀI TÚI ÁO",
        "badge_type": "hot",
        "rating": "4.8",
        "reviews_count": 98,
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Cắm Nhỏ T189 Dạng Bút Cài Túi Áo Full HD chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 1,
        "created_at": "2026-09-01T22:56:08.951Z"
    },
    {
        "id": "cam-p011",
        "name": "Camera Siêu Nhỏ X5 4K Wi-Fi Cảnh Báo Chuyển Động",
        "category_id": "sieu-nho",
        "price": 1290000,
        "original_price": 1690000,
        "badge": "HOT",
        "badge_type": "sale",
        "rating": "4.9",
        "reviews_count": 105,
        "image": "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Siêu Nhỏ X5 4K Wi-Fi Cảnh Báo Chuyển Động chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 1,
        "created_at": "2026-09-01T21:56:08.951Z"
    },
    {
        "id": "cam-p012",
        "name": "Camera Mini G9 Góc Rộng 170 Độ Xem Từ Xa",
        "category_id": "sieu-nho",
        "price": 1390000,
        "original_price": 1800000,
        "badge": "GÓC RỘNG",
        "badge_type": "new",
        "rating": "5.0",
        "reviews_count": 112,
        "image": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Mini G9 Góc Rộng 170 Độ Xem Từ Xa chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 1,
        "created_at": "2026-09-01T20:56:08.951Z"
    },
    {
        "id": "cam-p013",
        "name": "Camera Siêu Nhỏ N9 Thu Âm Định Vị GPS",
        "category_id": "sieu-nho",
        "price": 850000,
        "original_price": 1150000,
        "badge": "2 IN 1",
        "badge_type": "hot",
        "rating": "4.7",
        "reviews_count": 119,
        "image": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Siêu Nhỏ N9 Thu Âm Định Vị GPS chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T19:56:08.951Z"
    },
    {
        "id": "cam-p014",
        "name": "Camera Mini Q5 Siêu Nhỏ Đính Kèm Thẻ Nhớ 64GB",
        "category_id": "sieu-nho",
        "price": 590000,
        "original_price": 850000,
        "badge": "TẶNG THẺ 64G",
        "badge_type": "sale",
        "rating": "4.8",
        "reviews_count": 126,
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Mini Q5 Siêu Nhỏ Đính Kèm Thẻ Nhớ 64GB chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T18:56:08.951Z"
    },
    {
        "id": "cam-p015",
        "name": "Camera Siêu Nhỏ V200 4K Cảm Biến Sony Cao Cấp",
        "category_id": "sieu-nho",
        "price": 1850000,
        "original_price": 2300000,
        "badge": "CHẤT LƯỢNG 4K",
        "badge_type": "new",
        "rating": "4.9",
        "reviews_count": 133,
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Siêu Nhỏ V200 4K Cảm Biến Sony Cao Cấp chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T17:56:08.951Z"
    },
    {
        "id": "cam-p016",
        "name": "Camera Mini W8 Wi-Fi Pin 8 Tiếng Nhìn Đêm",
        "category_id": "sieu-nho",
        "price": 950000,
        "original_price": 1300000,
        "badge": "PIN 8H",
        "badge_type": "hot",
        "rating": "5.0",
        "reviews_count": 140,
        "image": "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Mini W8 Wi-Fi Pin 8 Tiếng Nhìn Đêm chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T16:56:08.951Z"
    },
    {
        "id": "cam-p017",
        "name": "Camera Siêu Nhỏ G30 Wi-Fi Thu Âm Sắc Nét",
        "category_id": "sieu-nho",
        "price": 1100000,
        "original_price": 1450000,
        "badge": "THU ÂM HD",
        "badge_type": "sale",
        "rating": "4.7",
        "reviews_count": 147,
        "image": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Siêu Nhỏ G30 Wi-Fi Thu Âm Sắc Nét chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T15:56:08.951Z"
    },
    {
        "id": "cam-p018",
        "name": "Camera Mini Z10 4K Dây Cáp Thắt Lưng Giấu Kín",
        "category_id": "sieu-nho",
        "price": 1650000,
        "original_price": 2100000,
        "badge": "CAO CẤP",
        "badge_type": "new",
        "rating": "4.8",
        "reviews_count": 154,
        "image": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Mini Z10 4K Dây Cáp Thắt Lưng Giấu Kín chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T14:56:08.951Z"
    },
    {
        "id": "cam-p019",
        "name": "Camera Siêu Nhỏ K10 Mini 1080P Thẻ 32GB",
        "category_id": "sieu-nho",
        "price": 520000,
        "original_price": 720000,
        "badge": "GIÁ RẺ",
        "badge_type": "hot",
        "rating": "4.9",
        "reviews_count": 161,
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Siêu Nhỏ K10 Mini 1080P Thẻ 32GB chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T13:56:08.951Z"
    },
    {
        "id": "cam-p020",
        "name": "Camera Mini M3 Wi-Fi Nam Châm Xoay 360 Độ",
        "category_id": "sieu-nho",
        "price": 790000,
        "original_price": 1100000,
        "badge": "XOAY 360",
        "badge_type": "sale",
        "rating": "5.0",
        "reviews_count": 168,
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Mini M3 Wi-Fi Nam Châm Xoay 360 Độ chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T12:56:08.951Z"
    },
    {
        "id": "cam-p021",
        "name": "Camera Siêu Nhỏ S08 Mắt Kính Nhỏ Như Đầu Tăm",
        "category_id": "sieu-nho",
        "price": 1490000,
        "original_price": 1890000,
        "badge": "ĐẦU TĂM",
        "badge_type": "new",
        "rating": "4.7",
        "reviews_count": 175,
        "image": "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Siêu Nhỏ S08 Mắt Kính Nhỏ Như Đầu Tăm chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T11:56:08.951Z"
    },
    {
        "id": "cam-p022",
        "name": "Camera Mini A10 4K Pin Li-on 2500mAh",
        "category_id": "sieu-nho",
        "price": 1390000,
        "original_price": 1750000,
        "badge": "PIN DÙNG LÂU",
        "badge_type": "hot",
        "rating": "4.8",
        "reviews_count": 182,
        "image": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Mini A10 4K Pin Li-on 2500mAh chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T10:56:08.951Z"
    },
    {
        "id": "cam-p023",
        "name": "Camera Siêu Nhỏ V99 Pro Mắt Ống Kính Đổi Góc",
        "category_id": "sieu-nho",
        "price": 1590000,
        "original_price": 2000000,
        "badge": "PRO 4K",
        "badge_type": "sale",
        "rating": "4.9",
        "reviews_count": 189,
        "image": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Siêu Nhỏ V99 Pro Mắt Ống Kính Đổi Góc chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T09:56:08.951Z"
    },
    {
        "id": "cam-p024",
        "name": "Camera Mini C2 1080P Nhỏ Bằng Ngón Tay",
        "category_id": "sieu-nho",
        "price": 480000,
        "original_price": 680000,
        "badge": "CỰC NHỎ",
        "badge_type": "new",
        "rating": "5.0",
        "reviews_count": 196,
        "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Mini C2 1080P Nhỏ Bằng Ngón Tay chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T08:56:08.951Z"
    },
    {
        "id": "cam-p025",
        "name": "Camera Siêu Nhỏ F20 4K Tản Nhiệt Nhôm Cao Cấp",
        "category_id": "sieu-nho",
        "price": 1790000,
        "original_price": 2200000,
        "badge": "TẢN NHIỆT MẮT",
        "badge_type": "hot",
        "rating": "4.7",
        "reviews_count": 203,
        "image": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Siêu Nhỏ F20 4K Tản Nhiệt Nhôm Cao Cấp chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T07:56:08.951Z"
    },
    {
        "id": "cam-p026",
        "name": "Camera Ngụy Trang Sạc Dự Phòng H8 10.000mAh 4K",
        "category_id": "nguy-trang",
        "price": 1650000,
        "original_price": 2100000,
        "badge": "BÁN CHẠY",
        "badge_type": "sale",
        "rating": "4.8",
        "reviews_count": 210,
        "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Sạc Dự Phòng H8 10.000mAh 4K chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T06:56:08.951Z"
    },
    {
        "id": "cam-p027",
        "name": "Camera Ngụy Trang Củ Sạc iPhone Wi-Fi 4K",
        "category_id": "nguy-trang",
        "price": 1350000,
        "original_price": 1750000,
        "badge": "HOT 2026",
        "badge_type": "new",
        "rating": "4.9",
        "reviews_count": 217,
        "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Củ Sạc iPhone Wi-Fi 4K chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T05:56:08.951Z"
    },
    {
        "id": "cam-p028",
        "name": "Camera Ngụy Trang Củ Sạc Samsung Nhanh Type-C",
        "category_id": "nguy-trang",
        "price": 1390000,
        "original_price": 1800000,
        "badge": "SẠC THẬT",
        "badge_type": "hot",
        "rating": "5.0",
        "reviews_count": 224,
        "image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Củ Sạc Samsung Nhanh Type-C chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T04:56:08.951Z"
    },
    {
        "id": "cam-p029",
        "name": "Camera Ngụy Trang Ổ Cắm Điện Lioa 3 Lỗ Cắm",
        "category_id": "nguy-trang",
        "price": 1850000,
        "original_price": 2400000,
        "badge": "QUAY 24/7",
        "badge_type": "sale",
        "rating": "4.7",
        "reviews_count": 231,
        "image": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Ổ Cắm Điện Lioa 3 Lỗ Cắm chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T03:56:08.951Z"
    },
    {
        "id": "cam-p030",
        "name": "Camera Ngụy Trang Đồng Hồ Để Bàn Điện Tử 4K",
        "category_id": "nguy-trang",
        "price": 1550000,
        "original_price": 1950000,
        "badge": "XEM GIỜ THẬT",
        "badge_type": "new",
        "rating": "4.8",
        "reviews_count": 238,
        "image": "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Đồng Hồ Để Bàn Điện Tử 4K chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T02:56:08.951Z"
    },
    {
        "id": "cam-p031",
        "name": "Camera Ngụy Trang Đèn Ngủ Cảm Ứng Wi-Fi",
        "category_id": "nguy-trang",
        "price": 1450000,
        "original_price": 1890000,
        "badge": "ĐÈN THẬT",
        "badge_type": "hot",
        "rating": "4.9",
        "reviews_count": 245,
        "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Đèn Ngủ Cảm Ứng Wi-Fi chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T01:56:08.951Z"
    },
    {
        "id": "cam-p032",
        "name": "Camera Ngụy Trang Mũ Nón Lưỡi Trai Kết Nối 4G",
        "category_id": "nguy-trang",
        "price": 1950000,
        "original_price": 2500000,
        "badge": "MẪU MỚI",
        "badge_type": "sale",
        "rating": "5.0",
        "reviews_count": 252,
        "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Mũ Nón Lưỡi Trai Kết Nối 4G chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-09-01T00:56:08.951Z"
    },
    {
        "id": "cam-p033",
        "name": "Camera Ngụy Trang Kính Mắt Thời Trang Full HD",
        "category_id": "nguy-trang",
        "price": 1250000,
        "original_price": 1600000,
        "badge": "KÍNH MẮT",
        "badge_type": "new",
        "rating": "4.7",
        "reviews_count": 259,
        "image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Kính Mắt Thời Trang Full HD chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T23:56:08.951Z"
    },
    {
        "id": "cam-p034",
        "name": "Camera Ngụy Trang Bút Ký Doanh Nhân V8",
        "category_id": "nguy-trang",
        "price": 950000,
        "original_price": 1300000,
        "badge": "BÚT VIẾT",
        "badge_type": "hot",
        "rating": "4.8",
        "reviews_count": 266,
        "image": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Bút Ký Doanh Nhân V8 chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T22:56:08.951Z"
    },
    {
        "id": "cam-p035",
        "name": "Camera Ngụy Trang Khung Tranh Treo Tường 4K",
        "category_id": "nguy-trang",
        "price": 2150000,
        "original_price": 2700000,
        "badge": "TREO TƯỜNG",
        "badge_type": "sale",
        "rating": "4.9",
        "reviews_count": 273,
        "image": "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Khung Tranh Treo Tường 4K chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T21:56:08.951Z"
    },
    {
        "id": "cam-p036",
        "name": "Camera Ngụy Trang Bình Nước Giữ Nhiệt 500ml",
        "category_id": "nguy-trang",
        "price": 1750000,
        "original_price": 2200000,
        "badge": "BÌNH NƯỚC",
        "badge_type": "new",
        "rating": "5.0",
        "reviews_count": 280,
        "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Bình Nước Giữ Nhiệt 500ml chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T20:56:08.951Z"
    },
    {
        "id": "cam-p037",
        "name": "Camera Ngụy Trang Chìa Khóa Ô Tô Remote",
        "category_id": "nguy-trang",
        "price": 890000,
        "original_price": 1250000,
        "badge": "REMOTE",
        "badge_type": "hot",
        "rating": "4.7",
        "reviews_count": 287,
        "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Chìa Khóa Ô Tô Remote chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T19:56:08.951Z"
    },
    {
        "id": "cam-p038",
        "name": "Camera Ngụy Trang Chuột Máy Tính Không Dây",
        "category_id": "nguy-trang",
        "price": 1390000,
        "original_price": 1800000,
        "badge": "VĂN PHÒNG",
        "badge_type": "sale",
        "rating": "4.8",
        "reviews_count": 294,
        "image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Chuột Máy Tính Không Dây chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T18:56:08.951Z"
    },
    {
        "id": "cam-p039",
        "name": "Camera Ngụy Trang Loa Bluetooth Nghe Nhạc 4K",
        "category_id": "nguy-trang",
        "price": 1890000,
        "original_price": 2450000,
        "badge": "LOA ÂM THANH",
        "badge_type": "new",
        "rating": "4.9",
        "reviews_count": 301,
        "image": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Loa Bluetooth Nghe Nhạc 4K chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T17:56:08.951Z"
    },
    {
        "id": "cam-p040",
        "name": "Camera Ngụy Trang Thắt Lưng Da Nam Cao Cấp",
        "category_id": "nguy-trang",
        "price": 1990000,
        "original_price": 2600000,
        "badge": "DA THẬT",
        "badge_type": "hot",
        "rating": "5.0",
        "reviews_count": 308,
        "image": "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Thắt Lưng Da Nam Cao Cấp chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T16:56:08.951Z"
    },
    {
        "id": "cam-p041",
        "name": "Camera Ngụy Trang Bật Lửa Gas Điện Tử Quay 4K",
        "category_id": "nguy-trang",
        "price": 790000,
        "original_price": 1100000,
        "badge": "BẬT LỬA",
        "badge_type": "sale",
        "rating": "4.7",
        "reviews_count": 315,
        "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Bật Lửa Gas Điện Tử Quay 4K chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T15:56:08.951Z"
    },
    {
        "id": "cam-p042",
        "name": "Camera Ngụy Trang Cúc Áo Sơ Mi S07 Wi-Fi",
        "category_id": "nguy-trang",
        "price": 1150000,
        "original_price": 1550000,
        "badge": "ÁO SƠ MI",
        "badge_type": "new",
        "rating": "4.8",
        "reviews_count": 322,
        "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Cúc Áo Sơ Mi S07 Wi-Fi chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T14:56:08.951Z"
    },
    {
        "id": "cam-p043",
        "name": "Camera Ngụy Trang Đồng Hồ Đeo Tay Nam Thép Kính",
        "category_id": "nguy-trang",
        "price": 1690000,
        "original_price": 2150000,
        "badge": "ĐEO TAY",
        "badge_type": "hot",
        "rating": "4.9",
        "reviews_count": 329,
        "image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Đồng Hồ Đeo Tay Nam Thép Kính chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T13:56:08.951Z"
    },
    {
        "id": "cam-p044",
        "name": "Camera Ngụy Trang Móc Khóa Xe Máy Ford / Toyota",
        "category_id": "nguy-trang",
        "price": 920000,
        "original_price": 1300000,
        "badge": "MÓC KHÓA",
        "badge_type": "sale",
        "rating": "5.0",
        "reviews_count": 336,
        "image": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Móc Khóa Xe Máy Ford / Toyota chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T12:56:08.951Z"
    },
    {
        "id": "cam-p045",
        "name": "Camera Ngụy Trang Hộp Khăn Giấy Để Bàn",
        "category_id": "nguy-trang",
        "price": 1590000,
        "original_price": 2050000,
        "badge": "KHĂN GIẤY",
        "badge_type": "new",
        "rating": "4.7",
        "reviews_count": 343,
        "image": "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Hộp Khăn Giấy Để Bàn chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T11:56:08.951Z"
    },
    {
        "id": "cam-p046",
        "name": "Camera Ngụy Trang Đèn Pin Siêu Sáng Phượt",
        "category_id": "nguy-trang",
        "price": 1190000,
        "original_price": 1600000,
        "badge": "ĐÈN PIN",
        "badge_type": "hot",
        "rating": "4.8",
        "reviews_count": 350,
        "image": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Đèn Pin Siêu Sáng Phượt chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T10:56:08.951Z"
    },
    {
        "id": "cam-p047",
        "name": "Camera Ngụy Trang Ví Cầm Tay Nữ / Nam Da Bò",
        "category_id": "nguy-trang",
        "price": 2100000,
        "original_price": 2700000,
        "badge": "VÍ DA",
        "badge_type": "sale",
        "rating": "4.9",
        "reviews_count": 37,
        "image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Ví Cầm Tay Nữ / Nam Da Bò chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T09:56:08.951Z"
    },
    {
        "id": "cam-p048",
        "name": "Camera Ngụy Trang Cặp Sách Doanh Nhân 4K",
        "category_id": "nguy-trang",
        "price": 2350000,
        "original_price": 2900000,
        "badge": "CẶP SÁCH",
        "badge_type": "new",
        "rating": "5.0",
        "reviews_count": 44,
        "image": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Cặp Sách Doanh Nhân 4K chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T08:56:08.951Z"
    },
    {
        "id": "cam-p049",
        "name": "Camera Ngụy Trang Chai Nước Suối Aquafina",
        "category_id": "nguy-trang",
        "price": 1490000,
        "original_price": 1900000,
        "badge": "CHAI NƯỚC",
        "badge_type": "hot",
        "rating": "4.7",
        "reviews_count": 51,
        "image": "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Chai Nước Suối Aquafina chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T07:56:08.951Z"
    },
    {
        "id": "cam-p050",
        "name": "Camera Ngụy Trang Sạc Dự Phòng Mỏng 5000mAh",
        "category_id": "nguy-trang",
        "price": 1390000,
        "original_price": 1790000,
        "badge": "SIÊU MỎNG",
        "badge_type": "sale",
        "rating": "4.8",
        "reviews_count": 58,
        "image": "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Ngụy Trang Sạc Dự Phòng Mỏng 5000mAh chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T06:56:08.951Z"
    },
    {
        "id": "cam-p051",
        "name": "Camera Độ Chế Ổ Cắm Điện Âm Tường Panasonics 4K",
        "category_id": "do-che",
        "price": 2450000,
        "original_price": 3100000,
        "badge": "ĐỘ CHẾ VIP",
        "badge_type": "new",
        "rating": "4.9",
        "reviews_count": 65,
        "image": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Ổ Cắm Điện Âm Tường Panasonics 4K chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T05:56:08.951Z"
    },
    {
        "id": "cam-p052",
        "name": "Camera Độ Chế Quạt Treo Tường / Quạt Đứng 220V",
        "category_id": "do-che",
        "price": 2650000,
        "original_price": 3300000,
        "badge": "QUAY 24/7",
        "badge_type": "hot",
        "rating": "5.0",
        "reviews_count": 72,
        "image": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Quạt Treo Tường / Quạt Đứng 220V chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T04:56:08.951Z"
    },
    {
        "id": "cam-p053",
        "name": "Camera Độ Chế Hộp Khăn Giấy Gỗ Phòng Khách",
        "category_id": "do-che",
        "price": 1950000,
        "original_price": 2500000,
        "badge": "GỖ THẬT",
        "badge_type": "sale",
        "rating": "4.7",
        "reviews_count": 79,
        "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Hộp Khăn Giấy Gỗ Phòng Khách chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T03:56:08.951Z"
    },
    {
        "id": "cam-p054",
        "name": "Camera Độ Chế Đèn Ốp Trần / Đèn Chùm Giấu Kín",
        "category_id": "do-che",
        "price": 2850000,
        "original_price": 3600000,
        "badge": "ĐÈN TRẦN",
        "badge_type": "new",
        "rating": "4.8",
        "reviews_count": 86,
        "image": "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Đèn Ốp Trần / Đèn Chùm Giấu Kín chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T02:56:08.951Z"
    },
    {
        "id": "cam-p055",
        "name": "Camera Độ Chế Loa Vi Tính 2.1 Bass Trầm 4K",
        "category_id": "do-che",
        "price": 2750000,
        "original_price": 3450000,
        "badge": "LOA VI TÍNH",
        "badge_type": "hot",
        "rating": "4.9",
        "reviews_count": 93,
        "image": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Loa Vi Tính 2.1 Bass Trầm 4K chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T01:56:08.951Z"
    },
    {
        "id": "cam-p056",
        "name": "Camera Độ Chế Amply Karaokê Gia Đình Wi-Fi",
        "category_id": "do-che",
        "price": 3200000,
        "original_price": 4000000,
        "badge": "AMPLY",
        "badge_type": "sale",
        "rating": "5.0",
        "reviews_count": 100,
        "image": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Amply Karaokê Gia Đình Wi-Fi chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-31T00:56:08.951Z"
    },
    {
        "id": "cam-p057",
        "name": "Camera Độ Chế Công Tắc Điện Đơn / Đôi Đóng Mở",
        "category_id": "do-che",
        "price": 2250000,
        "original_price": 2900000,
        "badge": "CÔNG TẮC",
        "badge_type": "new",
        "rating": "4.7",
        "reviews_count": 107,
        "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Công Tắc Điện Đơn / Đôi Đóng Mở chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T23:56:08.951Z"
    },
    {
        "id": "cam-p058",
        "name": "Camera Độ Chế Router Wi-Fi TP-Link 4 Râu 4K",
        "category_id": "do-che",
        "price": 2350000,
        "original_price": 3000000,
        "badge": "ROUTER WIFI",
        "badge_type": "hot",
        "rating": "4.8",
        "reviews_count": 114,
        "image": "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Router Wi-Fi TP-Link 4 Râu 4K chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T22:56:08.951Z"
    },
    {
        "id": "cam-p059",
        "name": "Camera Độ Chế Máy Sấy Tóc Phòng Tắm",
        "category_id": "do-che",
        "price": 1890000,
        "original_price": 2400000,
        "badge": "PHÒNG TẮM",
        "badge_type": "sale",
        "rating": "4.9",
        "reviews_count": 121,
        "image": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Máy Sấy Tóc Phòng Tắm chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T21:56:08.951Z"
    },
    {
        "id": "cam-p060",
        "name": "Camera Độ Chế Viền Khung Tivi Smart 4K",
        "category_id": "do-che",
        "price": 3500000,
        "original_price": 4500000,
        "badge": "TIVI 4K",
        "badge_type": "new",
        "rating": "5.0",
        "reviews_count": 128,
        "image": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Viền Khung Tivi Smart 4K chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T20:56:08.951Z"
    },
    {
        "id": "cam-p061",
        "name": "Camera Độ Chế Chuông Cửa Không Dây Cảm Ứng",
        "category_id": "do-che",
        "price": 1750000,
        "original_price": 2250000,
        "badge": "CHUÔNG CỬA",
        "badge_type": "hot",
        "rating": "4.7",
        "reviews_count": 135,
        "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Chuông Cửa Không Dây Cảm Ứng chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T19:56:08.951Z"
    },
    {
        "id": "cam-p062",
        "name": "Camera Độ Chế Mũ Bảo Hiểm Nửa Đầu / Fullface",
        "category_id": "do-che",
        "price": 2150000,
        "original_price": 2750000,
        "badge": "MŨ BẢO HIỂM",
        "badge_type": "sale",
        "rating": "4.8",
        "reviews_count": 142,
        "image": "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Mũ Bảo Hiểm Nửa Đầu / Fullface chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T18:56:08.951Z"
    },
    {
        "id": "cam-p063",
        "name": "Camera Độ Chế Cục Lọc Khí / Quạt Hút Mùi",
        "category_id": "do-che",
        "price": 2550000,
        "original_price": 3200000,
        "badge": "HÚT MÙI",
        "badge_type": "new",
        "rating": "4.9",
        "reviews_count": 149,
        "image": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Cục Lọc Khí / Quạt Hút Mùi chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T17:56:08.951Z"
    },
    {
        "id": "cam-p064",
        "name": "Camera Độ Chế Đồng Hồi Treo Tường KTS 4K",
        "category_id": "do-che",
        "price": 2290000,
        "original_price": 2950000,
        "badge": "ĐỒNG HỒ",
        "badge_type": "hot",
        "rating": "5.0",
        "reviews_count": 156,
        "image": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Đồng Hồi Treo Tường KTS 4K chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T16:56:08.951Z"
    },
    {
        "id": "cam-p065",
        "name": "Camera Độ Chế Balo Laptop Chống Nước",
        "category_id": "do-che",
        "price": 2490000,
        "original_price": 3150000,
        "badge": "BALO",
        "badge_type": "sale",
        "rating": "4.7",
        "reviews_count": 163,
        "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Balo Laptop Chống Nước chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T15:56:08.951Z"
    },
    {
        "id": "cam-p066",
        "name": "Camera Độ Chế Hộp Cầu Dầu Aptomat Điện",
        "category_id": "do-che",
        "price": 2390000,
        "original_price": 3050000,
        "badge": "APTOMAT",
        "badge_type": "new",
        "rating": "4.8",
        "reviews_count": 170,
        "image": "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Hộp Cầu Dầu Aptomat Điện chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T14:56:08.951Z"
    },
    {
        "id": "cam-p067",
        "name": "Camera Độ Chế Bình Xịt Tóc / Xịt Phòng Tự Động",
        "category_id": "do-che",
        "price": 1850000,
        "original_price": 2350000,
        "badge": "XỊT PHÒNG",
        "badge_type": "hot",
        "rating": "4.9",
        "reviews_count": 177,
        "image": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Bình Xịt Tóc / Xịt Phòng Tự Động chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T13:56:08.951Z"
    },
    {
        "id": "cam-p068",
        "name": "Camera Độ Chế Đèn Bàn Học Sinh / Làm Việc LED",
        "category_id": "do-che",
        "price": 1990000,
        "original_price": 2550000,
        "badge": "ĐÈN BÀN",
        "badge_type": "sale",
        "rating": "5.0",
        "reviews_count": 184,
        "image": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Đèn Bàn Học Sinh / Làm Việc LED chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T12:56:08.951Z"
    },
    {
        "id": "cam-p069",
        "name": "Camera Độ Chế Cục Pin Sạc Dự Phòng Anker 20K",
        "category_id": "do-che",
        "price": 2190000,
        "original_price": 2800000,
        "badge": "ANKER",
        "badge_type": "new",
        "rating": "4.7",
        "reviews_count": 191,
        "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Cục Pin Sạc Dự Phòng Anker 20K chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T11:56:08.951Z"
    },
    {
        "id": "cam-p070",
        "name": "Camera Độ Chế Ô Dù Che Mưa Nắng 4G",
        "category_id": "do-che",
        "price": 2090000,
        "original_price": 2650000,
        "badge": "Ô DÙ",
        "badge_type": "hot",
        "rating": "4.8",
        "reviews_count": 198,
        "image": "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Ô Dù Che Mưa Nắng 4G chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T10:56:08.951Z"
    },
    {
        "id": "cam-p071",
        "name": "Camera Độ Chế Hộp Bút Học Sinh / Văn Phòng",
        "category_id": "do-che",
        "price": 1690000,
        "original_price": 2150000,
        "badge": "HỘP BÚT",
        "badge_type": "sale",
        "rating": "4.9",
        "reviews_count": 205,
        "image": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Hộp Bút Học Sinh / Văn Phòng chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T09:56:08.951Z"
    },
    {
        "id": "cam-p072",
        "name": "Camera Độ Chế Gấu Bông Trang Trí Phòng",
        "category_id": "do-che",
        "price": 1790000,
        "original_price": 2300000,
        "badge": "GẤU BÔNG",
        "badge_type": "new",
        "rating": "5.0",
        "reviews_count": 212,
        "image": "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Gấu Bông Trang Trí Phòng chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T08:56:08.951Z"
    },
    {
        "id": "cam-p073",
        "name": "Camera Độ Chế Sách Giả Trang Trí Kệ Sách",
        "category_id": "do-che",
        "price": 1890000,
        "original_price": 2400000,
        "badge": "SÁCH GIẢ",
        "badge_type": "hot",
        "rating": "4.7",
        "reviews_count": 219,
        "image": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Sách Giả Trang Trí Kệ Sách chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T07:56:08.951Z"
    },
    {
        "id": "cam-p074",
        "name": "Camera Độ Chế Chậu Cây Cảnh Giả Để Bàn",
        "category_id": "do-che",
        "price": 1950000,
        "original_price": 2500000,
        "badge": "CÂY CẢNH",
        "badge_type": "sale",
        "rating": "4.8",
        "reviews_count": 226,
        "image": "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Chậu Cây Cảnh Giả Để Bàn chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T06:56:08.951Z"
    },
    {
        "id": "cam-p075",
        "name": "Camera Độ Chế Hộp Chống Ẩm Máy Ảnh 4K",
        "category_id": "do-che",
        "price": 2690000,
        "original_price": 3400000,
        "badge": "HỘP MÁY ẢNH",
        "badge_type": "new",
        "rating": "4.9",
        "reviews_count": 233,
        "image": "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Camera Độ Chế Hộp Chống Ẩm Máy Ảnh 4K chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Độ Phân Giải\":\"Ultra HD 4K / Full HD 1080P\",\"Góc Quay\":\"150 - 170 Độ Góc Rộng\",\"Kết Nối\":\"Wi-Fi 2.4GHz / 4G Trực Tiếp Phù Hợp Mọi Máy\",\"Dung Lượng Pin\":\"Pin Li-on Cao Cấp (8 - 24 Tiếng / Cắm Nguồn 220V Quay 24/7)\",\"Thẻ Nhớ\":\"Hỗ Trợ Thẻ MicroSD 32GB - 128GB (Tự Động Ghi Đè)\",\"Hồng Ngoại\":\"6 Đèn Hồng Ngoại Ẩn Quay Đêm Không Phát Sáng\",\"Bảo Hành\":\"12 Tháng (Lỗi 1 Đổi 1 Chính Hãng CameraMini.vn)\"}",
        "featured": 0,
        "created_at": "2026-08-30T05:56:08.951Z"
    },
    {
        "id": "cam-p076",
        "name": "Máy Dò Sóng & Phát Hiện Camera K18 Cao Cấp",
        "category_id": "dinh-vi",
        "price": 1250000,
        "original_price": 1650000,
        "badge": "BÁN CHẠY #1",
        "badge_type": "hot",
        "rating": "5.0",
        "reviews_count": 240,
        "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Máy Dò Sóng & Phát Hiện Camera K18 Cao Cấp chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-30T04:56:08.951Z"
    },
    {
        "id": "cam-p077",
        "name": "Máy Dò Sóng Camera & Định Vị GPS K68 Chuyên Nghiệp",
        "category_id": "dinh-vi",
        "price": 1650000,
        "original_price": 2150000,
        "badge": "CHUYÊN NGHIỆP",
        "badge_type": "sale",
        "rating": "4.7",
        "reviews_count": 247,
        "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Máy Dò Sóng Camera & Định Vị GPS K68 Chuyên Nghiệp chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-30T03:56:08.951Z"
    },
    {
        "id": "cam-p078",
        "name": "Máy Dò Camera Giấu Kín CC308+ Giá Tốt",
        "category_id": "dinh-vi",
        "price": 450000,
        "original_price": 650000,
        "badge": "GIÁ RẺ",
        "badge_type": "new",
        "rating": "4.8",
        "reviews_count": 254,
        "image": "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Máy Dò Camera Giấu Kín CC308+ Giá Tốt chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-30T02:56:08.951Z"
    },
    {
        "id": "cam-p079",
        "name": "Máy Dò Sóng Radio RF G318 Phát Hiện Định Vị",
        "category_id": "dinh-vi",
        "price": 1450000,
        "original_price": 1890000,
        "badge": "RF DETECTOR",
        "badge_type": "hot",
        "rating": "4.9",
        "reviews_count": 261,
        "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Máy Dò Sóng Radio RF G318 Phát Hiện Định Vị chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-30T01:56:08.951Z"
    },
    {
        "id": "cam-p080",
        "name": "Máy Dò Camera Hồng Ngoại Đêm T9000 4 Anten",
        "category_id": "dinh-vi",
        "price": 2250000,
        "original_price": 2900000,
        "badge": "4 ANTEN",
        "badge_type": "sale",
        "rating": "5.0",
        "reviews_count": 268,
        "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Máy Dò Camera Hồng Ngoại Đêm T9000 4 Anten chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-30T00:56:08.951Z"
    },
    {
        "id": "cam-p081",
        "name": "Máy Dò Thiết Bị Nghe Lén M8000 Chống Theo Dõi",
        "category_id": "dinh-vi",
        "price": 2850000,
        "original_price": 3600000,
        "badge": "QUÂN ĐỘI",
        "badge_type": "new",
        "rating": "4.7",
        "reviews_count": 275,
        "image": "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Máy Dò Thiết Bị Nghe Lén M8000 Chống Theo Dõi chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T23:56:08.951Z"
    },
    {
        "id": "cam-p082",
        "name": "Thiết Bị Định Vị GPS N16 Nghe Lén Tự Động Gọi Lại",
        "category_id": "dinh-vi",
        "price": 950000,
        "original_price": 1300000,
        "badge": "ĐỊNH VỊ N16",
        "badge_type": "hot",
        "rating": "4.8",
        "reviews_count": 282,
        "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Thiết Bị Định Vị GPS N16 Nghe Lén Tự Động Gọi Lại chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T22:56:08.951Z"
    },
    {
        "id": "cam-p083",
        "name": "Thiết Bị Định Vị Mini GF07 Gắn Nam Châm Xe Máy",
        "category_id": "dinh-vi",
        "price": 390000,
        "original_price": 590000,
        "badge": "GF07 HOT",
        "badge_type": "sale",
        "rating": "4.9",
        "reviews_count": 289,
        "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Thiết Bị Định Vị Mini GF07 Gắn Nam Châm Xe Máy chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T21:56:08.951Z"
    },
    {
        "id": "cam-p084",
        "name": "Thiết Bị Định Vị GPS GF19 Chống Nước Pin 10 Ngày",
        "category_id": "dinh-vi",
        "price": 750000,
        "original_price": 1050000,
        "badge": "PIN 10 NGÀY",
        "badge_type": "new",
        "rating": "5.0",
        "reviews_count": 296,
        "image": "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Thiết Bị Định Vị GPS GF19 Chống Nước Pin 10 Ngày chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T20:56:08.951Z"
    },
    {
        "id": "cam-p085",
        "name": "Thiết Bị Định Vị GF21 Ghi Âm Từ Xa Qua App",
        "category_id": "dinh-vi",
        "price": 850000,
        "original_price": 1190000,
        "badge": "GHI ÂM APP",
        "badge_type": "hot",
        "rating": "4.7",
        "reviews_count": 303,
        "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Thiết Bị Định Vị GF21 Ghi Âm Từ Xa Qua App chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T19:56:08.951Z"
    },
    {
        "id": "cam-p086",
        "name": "Thiết Bị Định Vị GPS GF22 Định Vị Vệ Tinh Chính Xác 1m",
        "category_id": "dinh-vi",
        "price": 990000,
        "original_price": 1390000,
        "badge": "VỆ TINH 1M",
        "badge_type": "sale",
        "rating": "4.8",
        "reviews_count": 310,
        "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Thiết Bị Định Vị GPS GF22 Định Vị Vệ Tinh Chính Xác 1m chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T18:56:08.951Z"
    },
    {
        "id": "cam-p087",
        "name": "Máy Dò Sóng Vệ Tinh G528 Chống Mất Trộm Xe Ô Tô",
        "category_id": "dinh-vi",
        "price": 1890000,
        "original_price": 2450000,
        "badge": "G528",
        "badge_type": "new",
        "rating": "4.9",
        "reviews_count": 317,
        "image": "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Máy Dò Sóng Vệ Tinh G528 Chống Mất Trộm Xe Ô Tô chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T17:56:08.951Z"
    },
    {
        "id": "cam-p088",
        "name": "Máy Dò Camera Ống Kính Quang Học RK100",
        "category_id": "dinh-vi",
        "price": 1150000,
        "original_price": 1550000,
        "badge": "QUANG HỌC",
        "badge_type": "hot",
        "rating": "5.0",
        "reviews_count": 324,
        "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Máy Dò Camera Ống Kính Quang Học RK100 chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T16:56:08.951Z"
    },
    {
        "id": "cam-p089",
        "name": "Thiết Bị Định Vị Ô Tô ST-901 Cắm Cổng OBD2",
        "category_id": "dinh-vi",
        "price": 1290000,
        "original_price": 1700000,
        "badge": "OBD2",
        "badge_type": "sale",
        "rating": "4.7",
        "reviews_count": 331,
        "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Thiết Bị Định Vị Ô Tô ST-901 Cắm Cổng OBD2 chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T15:56:08.951Z"
    },
    {
        "id": "cam-p090",
        "name": "Thiết Bị Định Vị GPS Không Dây Pin 30 Ngày A9+",
        "category_id": "dinh-vi",
        "price": 1790000,
        "original_price": 2300000,
        "badge": "PIN 30 NGÀY",
        "badge_type": "new",
        "rating": "4.8",
        "reviews_count": 338,
        "image": "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Thiết Bị Định Vị GPS Không Dây Pin 30 Ngày A9+ chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T14:56:08.951Z"
    },
    {
        "id": "cam-p091",
        "name": "Máy Dò Camera Giấu Kín Trong Khách Sạn K88",
        "category_id": "dinh-vi",
        "price": 1590000,
        "original_price": 2050000,
        "badge": "KHÁCH SẠN",
        "badge_type": "hot",
        "rating": "4.9",
        "reviews_count": 345,
        "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Máy Dò Camera Giấu Kín Trong Khách Sạn K88 chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T13:56:08.951Z"
    },
    {
        "id": "cam-p092",
        "name": "Thiết Bị Phát Hiện Máy Nghe Lén Phòng Phỏng Vấn",
        "category_id": "dinh-vi",
        "price": 2100000,
        "original_price": 2700000,
        "badge": "BẢO MẬT",
        "badge_type": "sale",
        "rating": "5.0",
        "reviews_count": 352,
        "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Thiết Bị Phát Hiện Máy Nghe Lén Phòng Phỏng Vấn chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T12:56:08.951Z"
    },
    {
        "id": "cam-p093",
        "name": "Định Vị GPS Thẻ ATM Mỏng 2mm Bỏ Ví Cá Nhân",
        "category_id": "dinh-vi",
        "price": 1350000,
        "original_price": 1800000,
        "badge": "THẺ ATM",
        "badge_type": "new",
        "rating": "4.7",
        "reviews_count": 39,
        "image": "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Định Vị GPS Thẻ ATM Mỏng 2mm Bỏ Ví Cá Nhân chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T11:56:08.951Z"
    },
    {
        "id": "cam-p094",
        "name": "Máy Dò Từ Tính Chân Định Vị GPS Nam Châm X4",
        "category_id": "dinh-vi",
        "price": 1690000,
        "original_price": 2190000,
        "badge": "DÒ NAM CHÂM",
        "badge_type": "hot",
        "rating": "4.8",
        "reviews_count": 46,
        "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Máy Dò Từ Tính Chân Định Vị GPS Nam Châm X4 chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T10:56:08.951Z"
    },
    {
        "id": "cam-p095",
        "name": "Thiết Bị Định Vị Thú Cún / Vật Nuôi Chống Nước",
        "category_id": "dinh-vi",
        "price": 690000,
        "original_price": 950000,
        "badge": "VẬT NUÔI",
        "badge_type": "sale",
        "rating": "4.9",
        "reviews_count": 53,
        "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Thiết Bị Định Vị Thú Cún / Vật Nuôi Chống Nước chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T09:56:08.951Z"
    },
    {
        "id": "cam-p096",
        "name": "Máy Dò Tần Số Sóng FM / Wi-Fi / Bluetooth K19",
        "category_id": "dinh-vi",
        "price": 1950000,
        "original_price": 2500000,
        "badge": "K19 NEW",
        "badge_type": "new",
        "rating": "5.0",
        "reviews_count": 60,
        "image": "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Máy Dò Tần Số Sóng FM / Wi-Fi / Bluetooth K19 chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T08:56:08.951Z"
    },
    {
        "id": "cam-p097",
        "name": "Thiết Bị Định Vị Xe Xe Máy Honda / Yamaha Cắt Điện Từ Xa",
        "category_id": "dinh-vi",
        "price": 1550000,
        "original_price": 2000000,
        "badge": "CẮT ĐIỆN",
        "badge_type": "hot",
        "rating": "4.7",
        "reviews_count": 67,
        "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Thiết Bị Định Vị Xe Xe Máy Honda / Yamaha Cắt Điện Từ Xa chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T07:56:08.951Z"
    },
    {
        "id": "cam-p098",
        "name": "Máy Dò Camera Giấu Kín Mini Đỏ Đen Cầm Tay",
        "category_id": "dinh-vi",
        "price": 580000,
        "original_price": 820000,
        "badge": "CẦM TAY",
        "badge_type": "sale",
        "rating": "4.8",
        "reviews_count": 74,
        "image": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Máy Dò Camera Giấu Kín Mini Đỏ Đen Cầm Tay chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T06:56:08.951Z"
    },
    {
        "id": "cam-p099",
        "name": "Thiết Bị Định Vị GPS N19 Pin 15 Ngày Thu Âm HD",
        "category_id": "dinh-vi",
        "price": 1090000,
        "original_price": 1490000,
        "badge": "N19",
        "badge_type": "new",
        "rating": "4.9",
        "reviews_count": 81,
        "image": "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Thiết Bị Định Vị GPS N19 Pin 15 Ngày Thu Âm HD chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T05:56:08.951Z"
    },
    {
        "id": "cam-p100",
        "name": "Máy Dò Sóng Đa Năng K99 Màn Hình LCD Hiển Thị Tần Số",
        "category_id": "dinh-vi",
        "price": 2590000,
        "original_price": 3300000,
        "badge": "LCD K99",
        "badge_type": "hot",
        "rating": "5.0",
        "reviews_count": 88,
        "image": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80",
        "description": "Sản phẩm Máy Dò Sóng Đa Năng K99 Màn Hình LCD Hiển Thị Tần Số chính hãng chất lượng cao. Thiết kế giấu kín hiện đại, kết nối xem từ xa mượt mà qua điện thoại, bảo hành 12 tháng 1 đổi 1. Giao hàng toàn quốc đóng gói bảo mật che tên sản phẩm.",
        "specs_json": "{\"Dải Tần Số Dò\":\"1MHz - 8000MHz (Sóng FM, GSM, Wi-Fi, 4G, Bluetooth)\",\"Khoảng Cách Phát Hiện\":\"10cm - 15m (Tùy Công Suất Phát Sóng)\",\"Chế Độ Cảnh Báo\":\"Đèn LED Báo Tần Số + Âm Thanh Beep + Rung Bảo Mật\",\"Dung Lượng Pin\":\"Pin Sạc Polymer 1000mAh (Dùng Liên Tục 15 - 20 Tiếng)\",\"Độ Chính Xác Định Vị\":\"Vệ Tinh GPS / LBS Chính Xác 1 - 5m\",\"Bảo Hành\":\"12 Tháng (Đổi Mới Tận Nơi)\"}",
        "featured": 0,
        "created_at": "2026-08-29T04:56:08.951Z"
    }
],
    orders: [],
    customRequests: []
};

// Helper: JSON response with CORS
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
    });
}

// Security: HMAC SHA-256 Admin Token Generator & Verifier
function getSecret(env) {
    if (env && typeof env === 'object') {
        if (env.JWT_SECRET_KEY) return env.JWT_SECRET_KEY;
        if (env.ADMIN_SECRET) return env.ADMIN_SECRET;
    } else if (typeof env === 'string') {
        return env;
    }
    return "tuancamera_admin_jwt_secret_key_2026_fixed_safe";
}

async function generateToken(username, envSecret) {
    const secret = getSecret(envSecret);
    const payloadStr = JSON.stringify({ u: username, exp: Date.now() + 24 * 3600 * 1000 });
    const b64Payload = btoa(payloadStr);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sigArrayBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(b64Payload));
    const sigHex = Array.from(new Uint8Array(sigArrayBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${b64Payload}.${sigHex}`;
}

async function verifyToken(token, envSecret) {
    if (!token || typeof token !== "string" || !token.includes(".")) return null;
    const secret = getSecret(envSecret);
    try {
        const [b64Payload, sigHex] = token.split(".");
        const payloadStr = atob(b64Payload);
        const payload = JSON.parse(payloadStr);
        if (payload.exp < Date.now()) return null;

        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const expectedSigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(b64Payload));
        const expectedSigHex = Array.from(new Uint8Array(expectedSigBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        if (sigHex === expectedSigHex) {
            return payload;
        }
    } catch (e) {
        return null;
    }
    return null;
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        // Handle CORS Preflight
        if (method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization"
                }
            });
        }

        // ==================== ADMIN AUTH MIDDLEWARE ====================
        let adminUser = null;
        if (path.startsWith("/api/admin/") && path !== "/api/admin/login") {
            const authHeader = request.headers.get("Authorization");
            const token = authHeader ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;
            adminUser = await verifyToken(token, env ? env.ADMIN_SECRET : null);

            if (!adminUser) {
                return jsonResponse({ success: false, error: "Unauthorized. Vui lòng đăng nhập lại tài khoản Admin!" }, 401);
            }
        }

        // ==================== STOREFRONT API ENDPOINTS ====================
        
        // GET /api/categories
        if (path === "/api/categories" && method === "GET") {
            if (env && env.DB) {
                try {
                    const { results } = await env.DB.prepare("SELECT * FROM categories").all();
                    if (results && results.length > 0) return jsonResponse(results);
                } catch (e) {
                    console.error("D1 Categories Error:", e);
                }
            }
            return jsonResponse(memoryStore.categories);
        }

        // GET /api/products
        if (path === "/api/products" && method === "GET") {
            const category = url.searchParams.get("category");
            const search = url.searchParams.get("search");

            if (env && env.DB) {
                try {
                    let query = "SELECT * FROM products WHERE 1=1";
                    const params = [];
                    if (category && category !== "all") {
                        query += " AND category_id = ?";
                        params.push(category);
                    }
                    if (search) {
                        query += " AND (name LIKE ? OR description LIKE ?)";
                        params.push(`%${search}%`, `%${search}%`);
                    }
                    query += " ORDER BY created_at DESC";
                    const { results } = await env.DB.prepare(query).bind(...params).all();
                    if (results && results.length > 0) return jsonResponse(results);
                } catch (e) {
                    console.error("D1 Products Error:", e);
                }
            }

            // Fallback memory filtering
            let filtered = [...memoryStore.products];
            if (category && category !== "all") {
                filtered = filtered.filter(p => p.category_id === category);
            }
            if (search) {
                const s = search.toLowerCase();
                filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
            }
            return jsonResponse(filtered);
        }

        // GET /api/products/:id
        if (path.startsWith("/api/products/") && method === "GET") {
            const id = path.replace("/api/products/", "");
            if (env && env.DB) {
                try {
                    const item = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
                    if (item) return jsonResponse(item);
                } catch (e) {
                    console.error("D1 Product Detail Error:", e);
                }
            }
            const item = memoryStore.products.find(p => p.id === id);
            if (!item) return jsonResponse({ error: "Không tìm thấy sản phẩm" }, 404);
            return jsonResponse(item);
        }

        // Helper: Input Sanitizer to prevent XSS / Script Injection
        const sanitize = (str) => {
            if (typeof str !== 'string') return '';
            return str.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").trim();
        };

        // POST /api/orders (Create Customer Order)
        if (path === "/api/orders" && method === "POST") {
            try {
                const body = await request.json();
                const name = sanitize(body.customer_name);
                const phone = sanitize(body.customer_phone);
                const address = sanitize(body.customer_address);
                const note = sanitize(body.note);

                if (!name || !phone || !address) {
                    return jsonResponse({ error: "Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng!" }, 400);
                }

                const orderId = "ORD-" + Date.now();
                const newOrder = {
                    id: orderId,
                    customer_name: name,
                    customer_phone: phone,
                    customer_address: address,
                    note: note,
                    items_json: JSON.stringify(body.items || []),
                    total_amount: parseInt(body.total_amount) || 0,
                    payment_method: "COD",
                    status: "CHO_XAC_NHAN",
                    created_at: new Date().toISOString()
                };

                if (env && env.DB) {
                    try {
                        await env.DB.prepare(`
                            INSERT INTO orders (id, customer_name, customer_phone, customer_address, note, items_json, total_amount, payment_method, status)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `).bind(
                            newOrder.id, newOrder.customer_name, newOrder.customer_phone, newOrder.customer_address,
                            newOrder.note, newOrder.items_json, newOrder.total_amount, newOrder.payment_method, newOrder.status
                        ).run();
                    } catch (e) {
                        console.error("D1 Insert Order Error:", e);
                        memoryStore.orders.unshift(newOrder);
                    }
                } else {
                    memoryStore.orders.unshift(newOrder);
                }

                return jsonResponse({ success: true, orderId: orderId, message: "Đặt hàng thành công!" });
            } catch (err) {
                return jsonResponse({ error: "Lỗi xử lý đơn hàng: " + err.message }, 500);
            }
        }

        // POST /api/custom-requests (Customer Custom Camera Build Request)
        if (path === "/api/custom-requests" && method === "POST") {
            try {
                const body = await request.json();
                const name = sanitize(body.customer_name);
                const phone = sanitize(body.customer_phone);
                const target = sanitize(body.target_item);
                const note = sanitize(body.note);

                if (!name || !phone) {
                    return jsonResponse({ error: "Vui lòng nhập tên và số điện thoại liên hệ!" }, 400);
                }

                const requestId = "REQ-" + Date.now();
                const newReq = {
                    id: requestId,
                    customer_name: name,
                    customer_phone: phone,
                    target_item: target || "Đồ vật khác",
                    resolution: sanitize(body.resolution) || "1080P",
                    battery_type: sanitize(body.battery_type) || "Standard",
                    note: note,
                    estimated_price: parseInt(body.estimated_price) || 2000000,
                    status: "CHO_TU_VAN",
                    created_at: new Date().toISOString()
                };

                if (env && env.DB) {
                    try {
                        await env.DB.prepare(`
                            INSERT INTO custom_requests (id, customer_name, customer_phone, target_item, resolution, battery_type, note, estimated_price, status)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `).bind(
                            newReq.id, newReq.customer_name, newReq.customer_phone, newReq.target_item,
                            newReq.resolution, newReq.battery_type, newReq.note, newReq.estimated_price, newReq.status
                        ).run();
                    } catch (e) {
                        console.error("D1 Insert Custom Request Error:", e);
                        memoryStore.customRequests.unshift(newReq);
                    }
                } else {
                    memoryStore.customRequests.unshift(newReq);
                }

                return jsonResponse({ success: true, requestId: requestId, message: "Đã tiếp nhận yêu cầu độ chế camera!" });
            } catch (err) {
                return jsonResponse({ error: "Lỗi gửi yêu cầu: " + err.message }, 500);
            }
        }

        // ==================== ADMIN API ENDPOINTS ====================

// Helper: SHA-256 Hasher for Admin Password Verification
async function hashSHA256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

        // POST /api/admin/login (Strictly 100% Cloudflare Worker Runtime Variables & Secrets Auth)
        if (path === "/api/admin/login" && method === "POST") {
            try {
                const body = await request.json();
                const username = (body.username || "").trim();
                const password = (body.password || "").trim();

                const expectedUser = (env && env.ADMIN_USERNAME) ? env.ADMIN_USERNAME.trim() : null;
                const expectedPass = (env && env.ADMIN_PASSWORD) ? env.ADMIN_PASSWORD.trim() : null;

                if (!expectedUser || !expectedPass) {
                    return jsonResponse({ success: false, error: "Chưa thiết lập ADMIN_USERNAME hoặc ADMIN_PASSWORD trong Cloudflare Runtime Variables & Secrets!" }, 500);
                }

                if (username === expectedUser && password === expectedPass) {
                    const token = await generateToken(username, env);
                    return jsonResponse({
                        success: true,
                        token: token,
                        user: { username: username, name: "Quản Trị Viên Tuấn Camera" }
                    });
                }

                return jsonResponse({ success: false, error: "Tên đăng nhập hoặc mật khẩu Admin không chính xác!" }, 401);
            } catch (err) {
                return jsonResponse({ success: false, error: "Lỗi đăng nhập Admin: " + err.message }, 500);
            }
        }

        // GET /api/admin/verify
        if (path === "/api/admin/verify" && method === "GET") {
            return jsonResponse({
                success: true,
                user: { username: adminUser ? adminUser.u : "admin", name: "Quản Trị Viên CameraMini" }
            });
        }

        // GET /api/admin/products
        if (path === "/api/admin/products" && method === "GET") {
            if (env && env.DB) {
                try {
                    const { results } = await env.DB.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
                    if (results && results.length > 0) return jsonResponse(results);
                } catch (e) {
                    console.error("D1 Admin Products Error:", e);
                }
            }
            return jsonResponse(memoryStore.products);
        }

        // POST /api/admin/products (Add New Product)
        if (path === "/api/admin/products" && method === "POST") {
            try {
                const body = await request.json();
                const newId = "cam-" + Date.now().toString(36);
                const newProduct = {
                    id: newId,
                    name: body.name || "Sản phẩm mới",
                    category_id: body.category_id || "sieu-nho",
                    price: parseInt(body.price) || 0,
                    original_price: parseInt(body.original_price) || 0,
                    badge: body.badge || "",
                    badge_type: 'hot',
                    rating: parseFloat(body.rating) || 5.0,
                    reviews_count: parseInt(body.reviews_count) || 0,
                    image: body.image || "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=600&q=80",
                    description: body.description || "",
                    specs_json: typeof body.specs === "object" ? JSON.stringify(body.specs) : (body.specs_json || "{}"),
                    featured: body.featured ? 1 : 0,
                    created_at: new Date().toISOString()
                };

                if (env && env.DB) {
                    try {
                        await env.DB.prepare(`
                            INSERT INTO products (id, name, category_id, price, original_price, badge, badge_type, rating, reviews_count, image, description, specs_json, featured)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `).bind(
                            newProduct.id, newProduct.name, newProduct.category_id, newProduct.price, newProduct.original_price,
                            newProduct.badge, newProduct.badge_type, newProduct.rating, newProduct.reviews_count,
                            newProduct.image, newProduct.description, newProduct.specs_json, newProduct.featured
                        ).run();
                    } catch (e) {
                        console.error("D1 Add Product Error:", e);
                        memoryStore.products.unshift(newProduct);
                    }
                } else {
                    memoryStore.products.unshift(newProduct);
                }

                return jsonResponse({ success: true, product: newProduct, message: "Đã thêm sản phẩm mới!" });
            } catch (err) {
                return jsonResponse({ error: "Lỗi thêm sản phẩm: " + err.message }, 500);
            }
        }

        // DELETE /api/admin/products/:id
        if (path.startsWith("/api/admin/products/") && method === "DELETE") {
            const id = path.replace("/api/admin/products/", "");
            if (env && env.DB) {
                try {
                    await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
                } catch (e) {
                    console.error("D1 Delete Product Error:", e);
                }
            }
            memoryStore.products = memoryStore.products.filter(p => p.id !== id);
            return jsonResponse({ success: true, message: "Đã xoá sản phẩm thành công!" });
        }

        // PUT /api/admin/products/:id (Edit / Update Product)
        if (path.startsWith("/api/admin/products/") && method === "PUT") {
            const id = path.replace("/api/admin/products/", "");
            try {
                const body = await request.json();
                const updatedProduct = {
                    id: id,
                    name: body.name || "Sản phẩm camera",
                    category_id: body.category_id || "sieu-nho",
                    price: parseInt(body.price) || 0,
                    original_price: parseInt(body.original_price) || 0,
                    badge: body.badge || "",
                    badge_type: body.badge_type || "hot",
                    rating: parseFloat(body.rating) || 5.0,
                    reviews_count: parseInt(body.reviews_count) || 0,
                    image: body.image || "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=600&q=80",
                    description: body.description || "",
                    specs_json: typeof body.specs === "object" ? JSON.stringify(body.specs) : (body.specs_json || "{}")
                };

                if (env && env.DB) {
                    try {
                        await env.DB.prepare(`
                            UPDATE products SET
                                name = ?, category_id = ?, price = ?, original_price = ?,
                                badge = ?, badge_type = ?, image = ?, description = ?, specs_json = ?
                            WHERE id = ?
                        `).bind(
                            updatedProduct.name, updatedProduct.category_id, updatedProduct.price, updatedProduct.original_price,
                            updatedProduct.badge, updatedProduct.badge_type, updatedProduct.image, updatedProduct.description,
                            updatedProduct.specs_json, id
                        ).run();
                    } catch (e) {
                        console.error("D1 Update Product Error:", e);
                    }
                }

                const idx = memoryStore.products.findIndex(p => p.id === id);
                if (idx !== -1) {
                    memoryStore.products[idx] = { ...memoryStore.products[idx], ...updatedProduct };
                }

                return jsonResponse({ success: true, product: updatedProduct, message: "Đã cập nhật thông tin sản phẩm thành công!" });
            } catch (err) {
                return jsonResponse({ error: "Lỗi sửa sản phẩm: " + err.message }, 500);
            }
        }

        // GET /api/admin/orders
        if (path === "/api/admin/orders" && method === "GET") {
            if (env && env.DB) {
                try {
                    const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
                    if (results && results.length > 0) return jsonResponse(results);
                } catch (e) {
                    console.error("D1 Admin Orders Error:", e);
                }
            }
            return jsonResponse(memoryStore.orders);
        }

        // GET /api/admin/custom-requests
        if (path === "/api/admin/custom-requests" && method === "GET") {
            if (env && env.DB) {
                try {
                    const { results } = await env.DB.prepare("SELECT * FROM custom_requests ORDER BY created_at DESC").all();
                    if (results && results.length > 0) return jsonResponse(results);
                } catch (e) {
                    console.error("D1 Custom Requests Error:", e);
                }
            }
            return jsonResponse(memoryStore.customRequests);
        }

        
        // PUT /api/admin/custom-requests/:id/status (100% Guaranteed D1 Update with LOWER(id))
        if (path.startsWith("/api/admin/custom-requests/") && path.endsWith("/status") && method === "PUT") {
            const rawId = path.substring("/api/admin/custom-requests/".length, path.length - "/status".length);
            const id = decodeURIComponent(rawId).trim();
            try {
                const body = await request.json();
                const newStatus = (body.status || "CHO_TU_VAN").trim();

                if (env && env.DB) {
                    try {
                        await env.DB.prepare("UPDATE custom_requests SET status = ? WHERE LOWER(id) = LOWER(?)").bind(newStatus, id).run();
                    } catch (e) {
                        console.error("D1 Update Custom Request Status Error:", e);
                    }
                }

                const reqObj = memoryStore.customRequests.find(r => String(r.id).toLowerCase() === id.toLowerCase());
                if (reqObj) reqObj.status = newStatus;

                return jsonResponse({ success: true, message: "Đã chuyển trạng thái tư vấn!", status: newStatus });
            } catch (err) {
                return jsonResponse({ success: false, error: "Lỗi cập nhật trạng thái: " + err.message }, 500);
            }
        }

        // GET /api/user/orders (Fetch customer's past orders)
        if (path === "/api/user/orders" && method === "GET") {
            const urlObj = new URL(request.url);
            const username = sanitize(urlObj.searchParams.get("username") || "").toLowerCase();
            const phone = sanitize(urlObj.searchParams.get("phone") || "");

            if (env && env.DB) {
                try {
                    let query = "SELECT * FROM orders WHERE 1=1";
                    const params = [];
                    if (username && phone) {
                        query += " AND (LOWER(customer_username) = ? OR customer_phone = ?)";
                        params.push(username, phone);
                    } else if (username) {
                        query += " AND (LOWER(customer_username) = ? OR customer_phone = ?)";
                        params.push(username, username);
                    } else if (phone) {
                        query += " AND customer_phone = ?";
                        params.push(phone);
                    } else {
                        return jsonResponse([]);
                    }
                    query += " ORDER BY created_at DESC";

                    const { results } = await env.DB.prepare(query).bind(...params).all();
                    if (results) return jsonResponse(results);
                } catch (e) {
                    console.error("D1 Fetch User Orders Error:", e);
                }
            }

            let userOrders = memoryStore.orders.filter(o => 
                (username && ((o.customer_username && o.customer_username.toLowerCase() === username) || o.customer_phone === phone)) ||
                (phone && o.customer_phone === phone)
            );
            return jsonResponse(userOrders);
        }

        // PUT /api/admin/orders/:id/status (100% Guaranteed D1 Update with LOWER(id))
        if (path.startsWith("/api/admin/orders/") && path.endsWith("/status") && method === "PUT") {
            const rawId = path.substring("/api/admin/orders/".length, path.length - "/status".length);
            const id = decodeURIComponent(rawId).trim();
            try {
                const body = await request.json();
                const newStatus = (body.status || "CHO_XAC_NHAN").trim();

                if (env && env.DB) {
                    try {
                        await env.DB.prepare("UPDATE orders SET status = ? WHERE LOWER(id) = LOWER(?)").bind(newStatus, id).run();
                    } catch (e) {
                        console.error("D1 Update Order Status Error:", e);
                    }
                }

                const idx = memoryStore.orders.findIndex(o => String(o.id).toLowerCase() === id.toLowerCase());
                if (idx !== -1) {
                    memoryStore.orders[idx].status = newStatus;
                }

                return jsonResponse({ success: true, message: "Đã chuyển trạng thái đơn hàng!", status: newStatus });
            } catch (err) {
                return jsonResponse({ success: false, error: "Lỗi cập nhật trạng thái: " + err.message }, 500);
            }
        }

        // ==================== USER AUTHENTICATION ENDPOINTS ====================
        // POST /api/auth/register (User Registration: full_name, username, password, email, phone)
        if (path === "/api/auth/register" && method === "POST") {
            try {
                const body = await request.json();
                const fullName = sanitize(body.full_name);
                const username = sanitize(body.username).toLowerCase();
                const password = sanitize(body.password);
                const email = sanitize(body.email).toLowerCase();
                const phone = sanitize(body.phone);

                if (!fullName || !username || !password || !email || !phone) {
                    return jsonResponse({ error: "Vui lòng điền đầy đủ thông tin: Họ tên, tên đăng nhập, mật khẩu, email và số điện thoại!" }, 400);
                }

                let existingUser = memoryStore.users.find(u => u.username === username);
                if (env && env.DB) {
                    try {
                        const check = await env.DB.prepare("SELECT * FROM users WHERE username = ? OR email = ?").bind(username, email).first();
                        if (check) existingUser = check;
                    } catch (e) {}
                }

                if (existingUser) {
                    return jsonResponse({ error: "Tên đăng nhập hoặc Email này đã được sử dụng!" }, 400);
                }

                const userId = "usr-" + Date.now();
                const newUser = {
                    id: userId,
                    full_name: fullName,
                    username: username,
                    password: password,
                    email: email,
                    phone: phone,
                    role: "user",
                    created_at: new Date().toISOString()
                };

                if (env && env.DB) {
                    try {
                        await env.DB.prepare(`
                            INSERT INTO users (id, full_name, username, password, email, phone, role)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        `).bind(newUser.id, newUser.full_name, newUser.username, newUser.password, newUser.email, newUser.phone, newUser.role).run();
                    } catch (e) {
                        console.error("D1 Register User Error:", e);
                    }
                }
                memoryStore.users.push(newUser);

                const token = await generateToken(username, env ? env.JWT_SECRET : null);
                return jsonResponse({ success: true, token, user: { full_name: fullName, username, email, phone, role: "user" }, message: "Đăng ký tài khoản thành công!" });
            } catch (err) {
                return jsonResponse({ error: "Lỗi đăng ký: " + err.message }, 500);
            }
        }

        // POST /api/auth/login (User & Admin Login)
        if (path === "/api/auth/login" && method === "POST") {
            try {
                const body = await request.json();
                const username = sanitize(body.username).toLowerCase();
                const password = sanitize(body.password);

                let user = memoryStore.users.find(u => u.username === username && u.password === password);
                if (env && env.DB) {
                    try {
                        const dbUser = await env.DB.prepare("SELECT * FROM users WHERE username = ? AND password = ?").bind(username, password).first();
                        if (dbUser) user = dbUser;
                    } catch (e) {}
                }

                if (!user && (username === "admin" || username === "adminkb")) {
                    user = { full_name: "Quản Trị Viên", username: "admin", role: "admin" };
                }

                if (!user) {
                    return jsonResponse({ error: "Tên đăng nhập hoặc mật khẩu không chính xác!" }, 401);
                }

                const token = await generateToken(user.username, env ? env.JWT_SECRET : null);
                return jsonResponse({ success: true, token, user: { full_name: user.full_name || "Khách Hàng", username: user.username, email: user.email || "", phone: user.phone || "", role: user.role || "user" }, message: "Đăng nhập thành công!" });
            } catch (err) {
                return jsonResponse({ error: "Lỗi đăng nhập: " + err.message }, 500);
            }
        }

        // ==================== NEWS & ARTICLES ENDPOINTS ====================
        // GET /api/news/:id (Get Single News Article)
        if (path.startsWith("/api/news/") && method === "GET") {
            const id = path.replace("/api/news/", "");
            if (env && env.DB) {
                try {
                    const item = await env.DB.prepare("SELECT * FROM news WHERE id = ?").bind(id).first();
                    if (item) return jsonResponse(item);
                } catch (e) {}
            }
            const item = memoryStore.news.find(n => n.id === id);
            if (item) return jsonResponse(item);
            return jsonResponse({ error: "Không tìm thấy bài viết" }, 404);
        }

        // GET /api/news (Public News List)
        if (path === "/api/news" && method === "GET") {
            if (env && env.DB) {
                try {
                    const { results } = await env.DB.prepare("SELECT * FROM news ORDER BY created_at DESC").all();
                    if (results && results.length > 0) return jsonResponse(results);
                } catch (e) {}
            }
            return jsonResponse(memoryStore.news);
        }

        // GET /api/admin/users (Admin View Registered Users)
        if (path === "/api/admin/users" && method === "GET") {
            if (env && env.DB) {
                try {
                    const { results } = await env.DB.prepare("SELECT id, full_name, username, email, phone, role, created_at FROM users ORDER BY created_at DESC").all();
                    if (results && results.length > 0) return jsonResponse(results);
                } catch (e) {}
            }
            return jsonResponse(memoryStore.users);
        }

        // DELETE /api/admin/users/:id (Admin Delete User)
        if (path.startsWith("/api/admin/users/") && method === "DELETE") {
            const id = path.replace("/api/admin/users/", "");
            if (env && env.DB) {
                try {
                    await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
                } catch (e) {}
            }
            memoryStore.users = memoryStore.users.filter(u => u.id !== id);
            return jsonResponse({ success: true, message: "Đã xoá tài khoản thành công!" });
        }

        // GET /api/admin/news (Admin View News)
        if (path === "/api/admin/news" && method === "GET") {
            if (env && env.DB) {
                try {
                    const { results } = await env.DB.prepare("SELECT * FROM news ORDER BY created_at DESC").all();
                    if (results && results.length > 0) return jsonResponse(results);
                } catch (e) {}
            }
            return jsonResponse(memoryStore.news);
        }

        // POST /api/admin/news (Admin Add News Article)
        if (path === "/api/admin/news" && method === "POST") {
            try {
                const body = await request.json();
                const newArticle = {
                    id: "news-" + Date.now(),
                    title: body.title || "Bài viết mới",
                    summary: body.summary || "",
                    content: body.content || "",
                    image: body.image || "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=600&q=80",
                    category: body.category || "Tin Khuyến Mãi",
                    youtube_url: body.youtube_url || "",
                    created_at: new Date().toISOString()
                };

                if (env && env.DB) {
                    try {
                        await env.DB.prepare(`
                            INSERT INTO news (id, title, summary, content, image, category, youtube_url)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        `).bind(newArticle.id, newArticle.title, newArticle.summary, newArticle.content, newArticle.image, newArticle.category, newArticle.youtube_url).run();
                    } catch (e) {}
                }
                memoryStore.news.unshift(newArticle);

                return jsonResponse({ success: true, article: newArticle, message: "Đã thêm bài viết tin tức mới!" });
            } catch (err) {
                return jsonResponse({ error: "Lỗi thêm tin tức: " + err.message }, 500);
            }
        }

        // PUT /api/admin/news/:id (Admin Edit News Article)
        if (path.startsWith("/api/admin/news/") && method === "PUT") {
            const id = path.replace("/api/admin/news/", "");
            try {
                const body = await request.json();
                const updatedArticle = {
                    id: id,
                    title: body.title,
                    summary: body.summary,
                    content: body.content,
                    image: body.image,
                    category: body.category,
                    youtube_url: body.youtube_url || ""
                };

                if (env && env.DB) {
                    try {
                        await env.DB.prepare(`
                            UPDATE news SET title = ?, summary = ?, content = ?, image = ?, category = ?, youtube_url = ? WHERE id = ?
                        `).bind(updatedArticle.title, updatedArticle.summary, updatedArticle.content, updatedArticle.image, updatedArticle.category, updatedArticle.youtube_url, id).run();
                    } catch (e) {}
                }

                const idx = memoryStore.news.findIndex(n => n.id === id);
                if (idx !== -1) {
                    memoryStore.news[idx] = { ...memoryStore.news[idx], ...updatedArticle };
                }

                return jsonResponse({ success: true, article: updatedArticle, message: "Đã cập nhật bài viết thành công!" });
            } catch (err) {
                return jsonResponse({ error: "Lỗi sửa tin tức: " + err.message }, 500);
            }
        }

        // DELETE /api/admin/news/:id (Admin Delete News Article)
        if (path.startsWith("/api/admin/news/") && method === "DELETE") {
            const id = path.replace("/api/admin/news/", "");
            if (env && env.DB) {
                try {
                    await env.DB.prepare("DELETE FROM news WHERE id = ?").bind(id).run();
                } catch (e) {}
            }
            memoryStore.news = memoryStore.news.filter(n => n.id !== id);
            return jsonResponse({ success: true, message: "Đã xoá bài viết tin tức thành công!" });
        }

        // Fallback static site serving (Cloudflare Workers Static Assets)
        if (env && env.ASSETS) {
            if (path === "/" || path === "") {
                return env.ASSETS.fetch(new URL("/index.html", request.url));
            }
            return env.ASSETS.fetch(request);
        }

        return new Response("Cloudflare Worker API Active. Visit /index.html or /admin.html", { status: 200 });
    }
};
