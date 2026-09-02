/**
 * Cloudflare Worker API + Asset Handler for CameraMini.vn
 */

// In-Memory Fallback Store (for quick preview/local testing before D1 deployment)
const memoryStore = {
    categories: [
        { id: 'sieu-nho', name: 'Camera Siêu Nhỏ', description: 'Các dòng camera kích thước cực nhỏ kết nối Wi-Fi xem từ xa' },
        { id: 'nguy-trang', name: 'Camera Ngụy Trang', description: 'Camera giấu kín dạng đồ vật: ổ điện, sạc dự phòng, đồng hồ, bút...' },
        { id: 'do-che', name: 'Camera Độ Chế', description: 'Thiết bị camera độ chế theo kích thước và vật dụng tùy chọn' },
        { id: 'dinh-vi', name: 'Máy Dò & Định Vị', description: 'Máy phát hiện camera giấu kín và máy dò sóng GSM/GPS' }
    ],
    products: [
        {
            id: 'cam-v99-4k',
            name: 'Camera Siêu Nhỏ V99 Dây Dù HD 4K Wi-Fi',
            category_id: 'sieu-nho',
            price: 1250000,
            original_price: 1650000,
            badge: 'BÁN CHẠY',
            badge_type: 'hot',
            rating: 4.9,
            reviews_count: 128,
            image: 'https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=600&q=80',
            description: 'Camera V99 phiên bản nâng cấp dây dù siêu bền, mắt kính 4K siêu nét, góc quay 150 độ, hỗ trợ quay đêm hồng ngoại ẩn không phát sáng.',
            specs_json: JSON.stringify({ resolution: "Ultra HD 4K / 1080P", battery: "4000mAh (Quay 8-10 tiếng)", connection: "Wi-Fi Xem xa qua App LookCam", storage: "Thẻ nhớ 128GB", nightVision: "Hồng ngoại ẩn 940nm" }),
            featured: 1
        },
        {
            id: 'cam-ocam-dien',
            name: 'Camera Ngụy Trang Ổ Cắm Điện Lioa Âm Tường',
            category_id: 'nguy-trang',
            price: 1850000,
            original_price: 2300000,
            badge: 'ĐỘ CHẾ HOT',
            badge_type: 'special',
            rating: 5.0,
            reviews_count: 94,
            image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=600&q=80',
            description: 'Thiết kế ngụy trang tinh vi trong ổ cắm điện thực tế. Vừa cắm điện gia dụng 220V bình thường vừa quay phim 24/7 không lo hết pin.',
            specs_json: JSON.stringify({ resolution: "Full HD 1080P / 2K", battery: "Nguồn điện trực tiếp 220V (Quay 24/7)", connection: "Wi-Fi xem từ xa 4G/5G qua điện thoại", storage: "Thẻ nhớ 64GB kèm theo", nightVision: "Tự động cân bằng sáng" }),
            featured: 1
        },
        {
            id: 'cam-sac-du-phong',
            name: 'Camera Ngụy Trang Sạc Dự Phòng 10.000mAh S100',
            category_id: 'nguy-trang',
            price: 1450000,
            original_price: 1900000,
            badge: 'GIẢM 24%',
            badge_type: 'sale',
            rating: 4.8,
            reviews_count: 76,
            image: 'https://images.unsplash.com/photo-1609592807688-660c23173e6b?auto=format&fit=crop&w=600&q=80',
            description: 'Kiểu dáng sạc dự phòng nhôm nguyên khối sang trọng, ngụy trang tuyệt đối. Tích hợp sạc nhanh cho điện thoại và camera giấu kín góc rộng.',
            specs_json: JSON.stringify({ resolution: "4K Quad HD", battery: "10.000mAh (Quay 15-18 tiếng)", connection: "Wi-Fi P2P / Xem xa qua App", storage: "Thẻ nhớ 128GB", nightVision: "4 Đèn hồng ngoại ẩn" }),
            featured: 1
        },
        {
            id: 'cam-dong-ho-de-ban',
            name: 'Camera Đồng Hồ Để Bàn Điện Tử Nhìn Đêm T12',
            category_id: 'nguy-trang',
            price: 1350000,
            original_price: 1700000,
            badge: 'MỚI 2026',
            badge_type: 'new',
            rating: 4.7,
            reviews_count: 52,
            image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=600&q=80',
            description: 'Đồng hồ hiển thị giờ, nhiệt độ và báo thức chuẩn xác. Mắt camera giấu sau mặt kính tráng gương đen hoàn toàn ẩn vô hình.',
            specs_json: JSON.stringify({ resolution: "1080P Full HD", battery: "Pin sạc + Cắm sạc liên tục", connection: "Kết nối Wi-Fi xem từ xa", storage: "Thẻ nhớ MicroSD 128GB", nightVision: "Cảm biến hồng ngoại quay đêm nét" }),
            featured: 0
        },
        {
            id: 'cam-a9-mini',
            name: 'Camera Mini A9 Cắm Thẻ Nhớ Wi-Fi Giá Rẻ',
            category_id: 'sieu-nho',
            price: 490000,
            original_price: 750000,
            badge: 'GIÁ TỐT',
            badge_type: 'sale',
            rating: 4.5,
            reviews_count: 310,
            image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
            description: 'Camera mini giá rẻ bán chạy nhất, kích thước đường kính chỉ 4cm, có đế nam hít tiện lợi gắn mọi bề mặt kim loại.',
            specs_json: JSON.stringify({ resolution: "HD 1080P", battery: "Pin tích hợp 60 phút", connection: "Wi-Fi HDWiFiCamPro", storage: "Thẻ nhớ TF tối đa 64GB", nightVision: "6 Đèn hồng ngoại LED" }),
            featured: 1
        },
        {
            id: 'may-phat-hien-k18',
            name: 'Máy Phát Hiện Camera Giấu Kín & Định Vị K18 Pro',
            category_id: 'dinh-vi',
            price: 1150000,
            original_price: 1500000,
            badge: 'KHUYÊN DÙNG',
            badge_type: 'hot',
            rating: 4.9,
            reviews_count: 204,
            image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=600&q=80',
            description: 'Thiết bị dò quét đa năng phát hiện các loại camera ẩn, máy nghe lén, máy định vị GPS gắn trên xe hơi hay trong phòng khách sạn.',
            specs_json: JSON.stringify({ resolution: "Tần số dò 1MHz - 6.5GHz", battery: "Pin 1000mAh dùng 6-8 tiếng", connection: "Cảm biến sóng RF + Laser", storage: "N/A", nightVision: "Đèn LED quét thấu kính" }),
            featured: 1
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
let cachedRuntimeSecret = null;
function getSecret(envSecret) {
    if (envSecret) return envSecret;
    if (!cachedRuntimeSecret) {
        cachedRuntimeSecret = crypto.randomUUID();
    }
    return cachedRuntimeSecret;
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
                const { results } = await env.DB.prepare("SELECT * FROM categories").all();
                return jsonResponse(results);
            }
            return jsonResponse(memoryStore.categories);
        }

        // GET /api/products
        if (path === "/api/products" && method === "GET") {
            const category = url.searchParams.get("category");
            const search = url.searchParams.get("search");

            if (env && env.DB) {
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
                return jsonResponse(results);
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
                const item = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
                if (!item) return jsonResponse({ error: "Không tìm thấy sản phẩm" }, 404);
                return jsonResponse(item);
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
                    await env.DB.prepare(`
                        INSERT INTO orders (id, customer_name, customer_phone, customer_address, note, items_json, total_amount, payment_method, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        newOrder.id, newOrder.customer_name, newOrder.customer_phone, newOrder.customer_address,
                        newOrder.note, newOrder.items_json, newOrder.total_amount, newOrder.payment_method, newOrder.status
                    ).run();
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
                    status: "CHO_TIEP_NHAN",
                    created_at: new Date().toISOString()
                };

                if (env && env.DB) {
                    await env.DB.prepare(`
                        INSERT INTO custom_requests (id, customer_name, customer_phone, target_item, resolution, battery_type, note, estimated_price, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        newReq.id, newReq.customer_name, newReq.customer_phone, newReq.target_item,
                        newReq.resolution, newReq.battery_type, newReq.note, newReq.estimated_price, newReq.status
                    ).run();
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

        // POST /api/admin/login
        if (path === "/api/admin/login" && method === "POST") {
            const body = await request.json();
            const username = (body.username || "").trim();
            const password = (body.password || "").trim();
            const passHash = await hashSHA256(password);

            // 1. Primary Auth: Query Cloudflare D1 SQL Database
            if (env && env.DB) {
                const adminAcc = await env.DB.prepare("SELECT * FROM admins WHERE username = ? AND password_hash = ?").bind(username, passHash).first();
                if (adminAcc) {
                    const token = await generateToken(adminAcc.username, env ? env.ADMIN_SECRET : null);
                    return jsonResponse({
                        success: true,
                        token: token,
                        user: { username: adminAcc.username, name: adminAcc.name }
                    });
                }
                return jsonResponse({ success: false, error: "Sai tên đăng nhập hoặc mật khẩu!" }, 401);
            }

            // 2. Secondary Auth: Secure Environment Variable Secret (configured via wrangler / Cloudflare Dashboard)
            if (env && env.ADMIN_PASSWORD_HASH) {
                const expectedUser = env.ADMIN_USERNAME || "admin";
                if (username === expectedUser && passHash === env.ADMIN_PASSWORD_HASH) {
                    const token = await generateToken(username, env ? env.ADMIN_SECRET : null);
                    return jsonResponse({
                        success: true,
                        token: token,
                        user: { username: username, name: "Quản Trị Viên CameraMini" }
                    });
                }
            }

            return jsonResponse({ success: false, error: "Xác thực thất bại. Cơ sở dữ liệu D1 chưa kết nối hoặc thông tin đăng nhập không đúng!" }, 401);
        }

        // GET /api/admin/verify
        if (path === "/api/admin/verify" && method === "GET") {
            return jsonResponse({
                success: true,
                user: { username: adminUser.u, name: "Quản Trị Viên CameraMini" }
            });
        }

        // GET /api/admin/products
        if (path === "/api/admin/products" && method === "GET") {
            if (env && env.DB) {
                const { results } = await env.DB.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
                return jsonResponse(results);
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
                    badge_type: body.badge_type || "hot",
                    rating: parseFloat(body.rating) || 5.0,
                    reviews_count: parseInt(body.reviews_count) || 0,
                    image: body.image || "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&w=600&q=80",
                    description: body.description || "",
                    specs_json: typeof body.specs === "object" ? JSON.stringify(body.specs) : (body.specs_json || "{}"),
                    featured: body.featured ? 1 : 0,
                    created_at: new Date().toISOString()
                };

                if (env && env.DB) {
                    await env.DB.prepare(`
                        INSERT INTO products (id, name, category_id, price, original_price, badge, badge_type, rating, reviews_count, image, description, specs_json, featured)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).bind(
                        newProduct.id, newProduct.name, newProduct.category_id, newProduct.price, newProduct.original_price,
                        newProduct.badge, newProduct.badge_type, newProduct.rating, newProduct.reviews_count,
                        newProduct.image, newProduct.description, newProduct.specs_json, newProduct.featured
                    ).run();
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
                await env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
            } else {
                memoryStore.products = memoryStore.products.filter(p => p.id !== id);
            }
            return jsonResponse({ success: true, message: "Đã xoá sản phẩm thành công!" });
        }

        // GET /api/admin/orders
        if (path === "/api/admin/orders" && method === "GET") {
            if (env && env.DB) {
                const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
                return jsonResponse(results);
            }
            return jsonResponse(memoryStore.orders);
        }

        // GET /api/admin/custom-requests
        if (path === "/api/admin/custom-requests" && method === "GET") {
            if (env && env.DB) {
                const { results } = await env.DB.prepare("SELECT * FROM custom_requests ORDER BY created_at DESC").all();
                return jsonResponse(results);
            }
            return jsonResponse(memoryStore.customRequests);
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
