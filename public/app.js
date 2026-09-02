/* ==========================================================================
   Tuấn Camera Storefront App Logic (Connected to Cloudflare Workers & D1)
   ========================================================================== */

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('tuancamera_cart') || '[]');
let currentLang = localStorage.getItem('tuancamera_lang') || 'vi';

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupSearch();
    setupCartControls();
    setupCustomBuildForm();
    setupTabs();
    setupAuthModal();
    setupUserOrdersModal();
    checkLoggedInUser();
    applyLanguage(currentLang);
    updateCartUI();
});

// i18n English / Vietnamese Translation Dictionary
const translations = {
    vi: {
        topWarranty: "Tuấn Camera - Bảo Hành 24 Tháng 1 Đổi 1 Tận Nơi",
        navHome: "TRANG CHỦ",
        navAbout: "GIỚI THIỆU",
        navProducts: "SẢN PHẨM ",
        navSupport: "HỖ TRỢ KHÁCH HÀNG ",
        navNews: "TIN TỨC ",
        navContact: "LIÊN HỆ",
        heroTitle: "TUẤN CAMERA Giải Pháp An Ninh",
        heroSub: "Hệ thống giám sát an ninh Tuấn Camera chính hãng. Độ nét Ultra HD 4K, công nghệ Full-Color xem đêm có màu sắc nét, bảo hành 24 tháng 1 đổi 1 tận nơi.",
        heroBtnProducts: "Khám Phá Sản Phẩm",
        heroBtnContact: "Đăng Ký Lắp Đặt",
        tabProducts: "SẢN PHẨM",
        tabTech: "CÔNG NGHỆ",
        secIp: "CAMERA IP TUẤN CAMERA 4K & WI-FI",
        secAnalog: "CAMERA HD-CVI ANALOG TUẤN CAMERA",
        secDauGhi: "ĐẦU GHI HÌNH TUẤN CAMERA (DVR / NVR 4K)",
        secKit: "BỘ KIT CAMERA TRỌN GÓI TUẤN CAMERA",
        btnBuyNow: "Mua Ngay",
        searchPlaceholder: "Tìm kiếm sản phẩm Tuấn Camera..."
    },
    en: {
        topWarranty: "Official Tuấn Camera 24-Month Warranty 1-to-1",
        navHome: "HOME",
        navAbout: "ABOUT US",
        navProducts: "PRODUCTS ",
        navSupport: "SUPPORT ",
        navNews: "NEWS ",
        navContact: "CONTACT",
        heroTitle: "TUẤN CAMERA Security Solutions",
        heroSub: "Tuấn Camera security surveillance system. Ultra HD 4K resolution, Full-Color 24/7 night vision, 24-month warranty.",
        heroBtnProducts: "Explore Products",
        heroBtnContact: "Request Installation",
        tabProducts: "PRODUCTS",
        tabTech: "TECHNOLOGY",
        secIp: "TUẤN CAMERA 4K & WI-FI IP CAMERAS",
        secAnalog: "TUẤN CAMERA HD-CVI ANALOG CAMERAS",
        secDauGhi: "TUẤN CAMERA DVR / NVR RECORDERS",
        secKit: "TUẤN CAMERA COMPLETE KITS",
        btnBuyNow: "Buy Now",
        searchPlaceholder: "Search products..."
    }
};

// Switch Language Selector
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('tuancamera_lang', lang);
    applyLanguage(lang);
}

function applyLanguage(lang) {
    const t = translations[lang] || translations.vi;

    const label = document.getElementById('currentLangLabel');
    if (label) {
        label.innerHTML = lang === 'en' 
            ? 'ENGLISH 🇲🇾 <i class="fa-solid fa-chevron-down nav-arrow"></i>' 
            : 'TIẾNG VIỆT 🇻🇳 <i class="fa-solid fa-chevron-down nav-arrow"></i>';
    }

    const topW = document.getElementById('topWarrantyText');
    if (topW) topW.textContent = t.topWarranty;

    const navHome = document.querySelector('.main-nav-item:nth-child(1) .main-nav-link');
    const navAbout = document.querySelector('.main-nav-item:nth-child(2) .main-nav-link');
    const navProducts = document.querySelector('.main-nav-item:nth-child(3) .main-nav-link');
    const navSupport = document.querySelector('.main-nav-item:nth-child(4) .main-nav-link');
    const navNews = document.querySelector('.main-nav-item:nth-child(5) .main-nav-link');
    const navContact = document.querySelector('.main-nav-item:nth-child(6) .main-nav-link');

    if (navHome) navHome.textContent = t.navHome;
    if (navAbout) navAbout.textContent = t.navAbout;
    if (navProducts) navProducts.innerHTML = t.navProducts + '<i class="fa-solid fa-chevron-down nav-arrow"></i>';
    if (navSupport) navSupport.innerHTML = t.navSupport + '<i class="fa-solid fa-chevron-down nav-arrow"></i>';
    if (navNews) navNews.innerHTML = t.navNews + '<i class="fa-solid fa-chevron-down nav-arrow"></i>';
    if (navContact) navContact.textContent = t.navContact;

    const heroH1 = document.querySelector('.hero-kb-text h1');
    const heroP = document.querySelector('.hero-kb-text p');
    if (heroH1) heroH1.innerHTML = lang === 'en' ? 'TUẤN CAMERA <span>Security Solutions</span>' : 'TUẤN CAMERA <span>Giải Pháp An Ninh</span>';
    if (heroP) heroP.textContent = t.heroSub;

    const tabP = document.getElementById('tabBtnProducts');
    const tabT = document.getElementById('tabBtnTech');
    if (tabP) tabP.textContent = t.tabProducts;
    if (tabT) tabT.textContent = t.tabTech;

    const secIp = document.querySelector('#section-camera-ip h2');
    const secAnalog = document.querySelector('#section-camera-analog h2');
    const secDauGhi = document.querySelector('#section-dau-ghi h2');
    const secKit = document.querySelector('#section-bo-tron-goi h2');

    if (secIp) secIp.textContent = t.secIp;
    if (secAnalog) secAnalog.textContent = t.secAnalog;
    if (secDauGhi) secDauGhi.textContent = t.secDauGhi;
    if (secKit) secKit.textContent = t.secKit;

    const searchIn = document.getElementById('searchInput');
    if (searchIn) searchIn.placeholder = t.searchPlaceholder;

    renderCategorizedHomepage(allProducts);
}

// User Auth Modal Controls & State
function setupAuthModal() {
    const modal = document.getElementById('authModal');
    const closeBtn = document.getElementById('closeAuthBtn');
    const tabLogin = document.getElementById('tabAuthLogin');
    const tabReg = document.getElementById('tabAuthRegister');
    const formLogin = document.getElementById('userLoginForm');
    const formReg = document.getElementById('userRegisterForm');

    closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));

    tabLogin?.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
        formLogin.style.display = 'block';
        formReg.style.display = 'none';
    });

    tabReg?.addEventListener('click', () => {
        tabReg.classList.add('active');
        tabLogin.classList.remove('active');
        formReg.style.display = 'block';
        formLogin.style.display = 'none';
    });

    formLogin?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('logUsername').value.trim();
        const password = document.getElementById('logPassword').value.trim();

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await res.json();
            if (result.success) {
                localStorage.setItem('tuancamera_user', JSON.stringify(result.user));
                checkLoggedInUser();
                modal?.classList.remove('active');
                formLogin.reset();
                showToast(`Xin chào, ${result.user.full_name}! Đăng nhập thành công.`, 'success');
            } else {
                throw new Error(result.error || 'Đăng nhập thất bại');
            }
        } catch (err) {
            showToast('Lỗi: ' + err.message, 'error');
        }
    });

    formReg?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const regData = {
            full_name: document.getElementById('regFullName').value.trim(),
            username: document.getElementById('regUsername').value.trim(),
            password: document.getElementById('regPassword').value.trim(),
            email: document.getElementById('regEmail').value.trim(),
            phone: document.getElementById('regPhone').value.trim()
        };

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(regData)
            });

            const result = await res.json();
            if (result.success) {
                localStorage.setItem('tuancamera_user', JSON.stringify(result.user));
                checkLoggedInUser();
                modal?.classList.remove('active');
                formReg.reset();
                showToast(`Chúc mừng ${result.user.full_name}! Đã tạo tài khoản Tuấn Camera thành công.`, 'success');
            } else {
                throw new Error(result.error || 'Đăng ký thất bại');
            }
        } catch (err) {
            showToast('Lỗi đăng ký: ' + err.message, 'error');
        }
    });
}

function openAuthModal() {
    document.getElementById('authModal')?.classList.add('active');
}

function checkLoggedInUser() {
    const userStr = localStorage.getItem('tuancamera_user');
    const container = document.getElementById('userHeaderAuth');
    if (!container) return;

    if (userStr) {
        const user = JSON.parse(userStr);
        container.innerHTML = `
            <span style="font-weight:700; color:#ffffff;"><i class="fa-solid fa-circle-user"></i> ${user.full_name}</span>
            <a href="javascript:void(0)" onclick="openUserOrdersModal()" style="color:#60a5fa; margin-left:10px;"><i class="fa-solid fa-receipt"></i> Đơn Hàng Của Tôi</a>
            <a href="javascript:void(0)" onclick="userLogout()" style="color:#f87171; margin-left:10px;"><i class="fa-solid fa-right-from-bracket"></i> Đăng Xuất</a>
            <a href="admin.html" style="color:#94a3b8; margin-left:12px;"><i class="fa-solid fa-user-shield"></i> Admin</a>
        `;

        // Pre-fill Checkout form if user is logged in
        const orderName = document.getElementById('orderName');
        const orderPhone = document.getElementById('orderPhone');
        if (orderName && !orderName.value) orderName.value = user.full_name || '';
        if (orderPhone && !orderPhone.value) orderPhone.value = user.phone || '';
    } else {
        container.innerHTML = `
            <a href="javascript:void(0)" onclick="openAuthModal()"><i class="fa-solid fa-user"></i> Đăng Nhập / Đăng Ký</a>
            <a href="admin.html" style="color:#94a3b8; margin-left:12px;"><i class="fa-solid fa-user-shield"></i> Admin</a>
        `;
    }
}

function userLogout() {
    localStorage.removeItem('tuancamera_user');
    checkLoggedInUser();
    showToast('Đã đăng xuất tài khoản thành công!');
}


function getOrderStatusBadge(st) {
    if (st === 'DA_THANH_TOAN') {
        return '<span style="background:#dcfce7; color:#15803d; padding:4px 10px; border-radius:12px; font-size:0.78rem; font-weight:800;"><i class="fa-solid fa-circle-check"></i> Đã Thanh Toán & Lắp Đặt</span>';
    } else if (st === 'DANG_GIAO_HANG') {
        return '<span style="background:#e0f2fe; color:#0369a1; padding:4px 10px; border-radius:12px; font-size:0.78rem; font-weight:800;"><i class="fa-solid fa-truck"></i> Đang Giao & Thi Công</span>';
    } else if (st === 'DA_XAC_NHAN') {
        return '<span style="background:#fef3c7; color:#b45309; padding:4px 10px; border-radius:12px; font-size:0.78rem; font-weight:800;"><i class="fa-solid fa-clipboard-check"></i> Đã Xác Nhận Đơn</span>';
    } else if (st === 'DA_HUY') {
        return '<span style="background:#fee2e2; color:#b91c1c; padding:4px 10px; border-radius:12px; font-size:0.78rem; font-weight:800;"><i class="fa-solid fa-circle-xmark"></i> Đã Hủy Đơn</span>';
    } else {
        return '<span style="background:#fef9c3; color:#a16207; padding:4px 10px; border-radius:12px; font-size:0.78rem; font-weight:800;"><i class="fa-solid fa-clock"></i> Đã Đặt (Chờ Xác Nhận)</span>';
    }
}

// User Order History Modal Logic
function setupUserOrdersModal() {
    const modal = document.getElementById('userOrdersModal');
    const closeBtn = document.getElementById('closeUserOrdersBtn');
    closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));
}

async function openUserOrdersModal() {
    const userStr = localStorage.getItem('tuancamera_user');
    if (!userStr) {
        openAuthModal();
        return;
    }

    const user = JSON.parse(userStr);
    const modal = document.getElementById('userOrdersModal');
    const container = document.getElementById('userOrdersList');

    if (modal) modal.classList.add('active');
    if (container) container.innerHTML = '<p style="text-align:center; color:#64748b; padding:25px;">Đang tải lịch sử đơn hàng...</p>';

    try {
        const res = await fetch(`/api/user/orders?username=${encodeURIComponent(user.username)}&phone=${encodeURIComponent(user.phone || '')}`);
        const orders = await res.json();

        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:35px 20px; color:#64748b;">
                    <i class="fa-solid fa-box-open" style="font-size:2.5rem; color:#cbd5e1; margin-bottom:12px;"></i>
                    <p style="font-weight:700;">Bạn chưa có đơn hàng nào tại Tuấn Camera.</p>
                    <p style="font-size:0.85rem; margin-top:4px;">Các sản phẩm bạn mua sẽ xuất hiện tại đây!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(o => {
            let items = [];
            try {
                items = typeof o.items_json === 'string' ? JSON.parse(o.items_json) : (o.items_json || []);
            } catch (e) {}

            const formattedTotal = new Intl.NumberFormat('vi-VN').format(o.total_amount) + ' đ';
            const orderDate = new Date(o.created_at || Date.now()).toLocaleDateString('vi-VN');

            return `
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px; margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:12px;">
                        <div>
                            <span style="font-weight:800; color:#0f172a; font-size:0.95rem;">Mã Đơn: ${o.id}</span>
                            <span style="font-size:0.8rem; color:#64748b; margin-left:10px;">📅 ${orderDate}</span>
                        </div>
                        ${getOrderStatusBadge(o.status)}
                    </div>

                    <div style="margin-bottom:12px;">
                        ${items.map(i => `
                            <div style="display:flex; gap:12px; align-items:center; margin-bottom:8px;">
                                <img src="${i.image}" alt="${i.name}" style="width:40px; height:40px; border-radius:6px; object-fit:contain; background:#ffffff; border:1px solid #e2e8f0;">
                                <div style="flex:1;">
                                    <h4 style="font-size:0.85rem; font-weight:700; color:#0f172a;">${i.name}</h4>
                                    <span style="font-size:0.8rem; color:#64748b;">x${i.quantity} | ${new Intl.NumberFormat('vi-VN').format(i.price)} đ</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #cbd5e1; padding-top:10px;">
                        <span style="font-size:0.85rem; color:#475569;">Giao tới: <strong>${o.customer_address}</strong></span>
                        <span style="font-size:1.05rem; font-weight:900; color:#0056b3;">${formattedTotal}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        container.innerHTML = '<p style="color:#ef4444; text-align:center;">Lỗi tải lịch sử đơn hàng.</p>';
    }
}

// Fetch products from Cloudflare Workers API
async function fetchProducts(category = 'all', search = '') {
    try {
        let url = '/api/products';
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (search) params.append('search', search);
        if (params.toString()) url += '?' + params.toString();

        const res = await fetch(url);
        if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm Tuấn Camera');
        
        allProducts = await res.json();

        if (category === 'all' && !search) {
            document.getElementById('categorized-sections-container').style.display = 'block';
            document.getElementById('filtered-view-section').style.display = 'none';
            renderCategorizedHomepage(allProducts);
        } else {
            document.getElementById('categorized-sections-container').style.display = 'none';
            document.getElementById('filtered-view-section').style.display = 'block';
            renderFilteredGrid(allProducts, category, search);
        }
    } catch (err) {
        console.error('API Error:', err);
    }
}

// Render Categorized Homepage Sections
function renderCategorizedHomepage(products) {
    const cameraIp = products.filter(p => p.category_id === 'camera-ip').slice(0, 8);
    const cameraAnalog = products.filter(p => p.category_id === 'camera-analog').slice(0, 8);
    const dauGhi = products.filter(p => p.category_id === 'dau-ghi').slice(0, 8);
    const boTronGoi = products.filter(p => p.category_id === 'bo-tron-goi').slice(0, 8);

    renderProductCardsToGrid('grid-camera-ip', cameraIp);
    renderProductCardsToGrid('grid-camera-analog', cameraAnalog);
    renderProductCardsToGrid('grid-dau-ghi', dauGhi);
    renderProductCardsToGrid('grid-bo-tron-goi', boTronGoi);
}

// Render Filtered / Search View Grid
function renderFilteredGrid(products, category, search) {
    const title = document.getElementById('filteredTitle');
    const label = document.getElementById('filteredCountLabel');
    const gridId = 'filteredProductsGrid';

    let catName = 'TẤT CẢ SẢN PHẨM TUẤN CAMERA';
    if (category === 'camera-ip') catName = 'CAMERA IP TUẤN CAMERA 4K';
    if (category === 'camera-analog') catName = 'CAMERA HD-CVI ANALOG';
    if (category === 'dau-ghi') catName = 'ĐẦU GHI HÌNH TUẤN CAMERA';
    if (category === 'bo-tron-goi') catName = 'BỘ KIT CAMERA TRỌN GÓI';

    if (search) {
        if (title) title.textContent = `KẾT QUẢ TÌM KIẾM TUẤN CAMERA: "${search}"`;
    } else {
        if (title) title.textContent = `DANH MỤC: ${catName}`;
    }

    if (label) label.textContent = `${products.length} sản phẩm phù hợp`;

    renderProductCardsToGrid(gridId, products);
}

// Render Product Cards to target container ID
function renderProductCardsToGrid(gridId, productsList) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    if (!productsList || productsList.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 30px; color: var(--text-muted);">
                <p>Chưa có sản phẩm nào trong mục này.</p>
            </div>
        `;
        return;
    }

    const btnBuyLabel = currentLang === 'en' ? 'Buy Now' : 'Mua Ngay';

    grid.innerHTML = productsList.map(p => {
        const formattedPrice = new Intl.NumberFormat('vi-VN').format(p.price) + ' đ';
        const formattedOldPrice = p.original_price ? new Intl.NumberFormat('vi-VN').format(p.original_price) + ' đ' : '';

        return `
            <div class="product-card">
                <div class="product-thumb" onclick="openProductDetail('${p.id}')" style="cursor:pointer;">
                    ${p.image ? `<img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.outerHTML='<div class=\\\"product-thumb-placeholder\\\"><i class=\\\"fa-solid fa-camera\\\"></i></div>'">` : `<div class="product-thumb-placeholder"><i class="fa-solid fa-camera"></i></div>`}
                </div>
                <div>
                    <h3 class="product-title" onclick="openProductDetail('${p.id}')" style="cursor:pointer;" title="${p.name}">${p.name}</h3>
                    <div class="product-price-row">
                        <span class="price-current">${formattedPrice}</span>
                        ${formattedOldPrice ? `<span class="price-old">${formattedOldPrice}</span>` : ''}
                    </div>
                </div>
                <div class="product-btn-group">
                    <button class="btn-card-buy" onclick="addToCart('${p.id}')">${btnBuyLabel}</button>
                    <a href="https://zalo.me/0797777071" target="_blank" class="btn-card-zalo">Zalo</a>
                </div>
            </div>
        `;
    }).join('');
}

// Clean Tab Navigation (SẢN PHẨM | CÔNG NGHỆ)
function setupTabs() {
    const tabProducts = document.getElementById('tabBtnProducts');
    const tabTech = document.getElementById('tabBtnTech');

    tabProducts?.addEventListener('click', () => {
        tabProducts.classList.add('active');
        tabTech.classList.remove('active');
        fetchProducts('all');
    });

    tabTech?.addEventListener('click', () => {
        tabTech.classList.add('active');
        tabProducts.classList.remove('active');
        fetchProducts('camera-ip');
    });
}

// Category Navigation Select
function selectCategory(cat) {
    fetchProducts(cat);
    window.scrollTo({ top: 500, behavior: 'smooth' });
}

// Live Search Setup
function setupSearch() {
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchBtn');

    if (input) {
        let timeout = null;
        input.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                fetchProducts('all', input.value.trim());
            }, 300);
        });
    }

    if (btn) {
        btn.addEventListener('click', () => {
            fetchProducts('all', input ? input.value.trim() : '');
        });
    }
}

// Open Standalone Product Detail Page
function openProductDetail(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Cart State Management
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
}

function updateCartQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('tuancamera_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const badge = document.getElementById('cartBadgeCount');
    const totalCount = cart.reduce((sum, i) => sum + i.quantity, 0);
    if (badge) badge.textContent = totalCount;

    const cartList = document.getElementById('cartItemsList');
    const totalLabel = document.getElementById('cartTotalAmount');

    if (!cartList) return;

    if (cart.length === 0) {
        cartList.innerHTML = `
            <div style="text-align:center; padding: 30px; color: var(--text-muted);">
                <p>Chưa có sản phẩm nào trong giỏ hàng Tuấn Camera.</p>
            </div>
        `;
        if (totalLabel) totalLabel.textContent = '0 đ';
        return;
    }

    let total = 0;
    cartList.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #e2e8f0;">
                <div style="display:flex; gap:10px; align-items:center;">
                    <img src="${item.image}" alt="${item.name}" style="width:40px; height:40px; border-radius:6px; object-fit:contain;">
                    <div>
                        <h4 style="font-size:0.85rem; font-weight:700;">${item.name}</h4>
                        <span style="color:#0056b3; font-size:0.8rem; font-weight:800;">
                            ${new Intl.NumberFormat('vi-VN').format(item.price)} đ
                        </span>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button onclick="updateCartQuantity('${item.id}', -1)" style="padding:2px 8px; cursor:pointer;">-</button>
                    <span style="font-weight:700; font-size:0.85rem;">${item.quantity}</span>
                    <button onclick="updateCartQuantity('${item.id}', 1)" style="padding:2px 8px; cursor:pointer;">+</button>
                </div>
            </div>
        `;
    }).join('');

    if (totalLabel) {
        totalLabel.textContent = new Intl.NumberFormat('vi-VN').format(total) + ' đ';
    }
}

// Redirect to Standalone Checkout Page
function setupCartControls() {
    document.getElementById('openCartBtn')?.addEventListener('click', () => {
        window.location.href = 'thanhtoan.html';
    });
}

// Custom Request Form Submit
function setupCustomBuildForm() {
    const form = document.getElementById('customBuildForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const customData = {
            customer_name: document.getElementById('customName').value.trim(),
            customer_phone: document.getElementById('customPhone').value.trim(),
            target_item: document.getElementById('customItemSelect').value,
            resolution: document.getElementById('customResSelect').value,
            battery_type: document.getElementById('customBatterySelect').value,
            note: document.getElementById('customNote').value.trim(),
            estimated_price: 3500000
        };

        try {
            const res = await fetch('/api/custom-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customData)
            });

            const result = await res.json();
            if (result.success) {
                form.reset();
                showToast('Đã gửi yêu cầu tư vấn khảo sát thành công! Tuấn Camera sẽ gọi lại tư vấn.', 'success');
            } else {
                throw new Error(result.error || 'Gửi thất bại');
            }
        } catch (err) {
            showToast('Lỗi gửi yêu cầu: ' + err.message, 'error');
        }
    });
}

// Toast System
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}
