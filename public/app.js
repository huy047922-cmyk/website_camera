/* ==========================================================================
   KBVISION.vn Storefront App Logic (Connected to Cloudflare Workers & D1)
   ========================================================================== */

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('kbvision_cart') || '[]');
let currentLang = localStorage.getItem('kbvision_lang') || 'vi';

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupSearch();
    setupCartControls();
    setupCustomBuildForm();
    setupTabs();
    setupAuthModal();
    checkLoggedInUser();
    applyLanguage(currentLang);
    updateCartUI();
});

// i18n English / Vietnamese Translation Dictionary
const translations = {
    vi: {
        topWarranty: "Bảo Hành 24 Tháng Chính Hãng KBVISION USA",
        navHome: "TRANG CHỦ",
        navAbout: "GIỚI THIỆU",
        navProducts: "SẢN PHẨM ",
        navSupport: "HỖ TRỢ KHÁCH HÀNG ",
        navNews: "TIN TỨC ",
        navContact: "LIÊN HỆ",
        heroTitle: "GIẢI PHÁP An Ninh Tổng Thể",
        heroSub: "Hệ thống giám sát an ninh KBVISION chuẩn thương hiệu Mỹ. Độ nét Ultra HD 4K, công nghệ Full-Color xem đêm có màu sắc nét, bảo hành 24 tháng 1 đổi 1 tận nơi.",
        heroBtnProducts: "Khám Phá Sản Phẩm",
        heroBtnContact: "Đăng Ký Lắp Đặt",
        tabProducts: "SẢN PHẨM",
        tabTech: "CÔNG NGHỆ",
        secIp: "CAMERA IP KBVISION 4K & WI-FI",
        secAnalog: "CAMERA HD-CVI ANALOG KBVISION",
        secDauGhi: "ĐẦU GHI HÌNH KBVISION (DVR / NVR 4K)",
        secKit: "BỘ KIT CAMERA TRỌN GÓI KBVISION",
        btnBuyNow: "Mua Ngay",
        searchPlaceholder: "Tìm kiếm sản phẩm..."
    },
    en: {
        topWarranty: "Official KBVISION USA 24-Month Warranty",
        navHome: "HOME",
        navAbout: "ABOUT US",
        navProducts: "PRODUCTS ",
        navSupport: "SUPPORT ",
        navNews: "NEWS ",
        navContact: "CONTACT",
        heroTitle: "TOTAL SECURITY SOLUTIONS",
        heroSub: "KBVISION USA security surveillance system. Ultra HD 4K resolution, Full-Color 24/7 night vision, 24-month warranty.",
        heroBtnProducts: "Explore Products",
        heroBtnContact: "Request Installation",
        tabProducts: "PRODUCTS",
        tabTech: "TECHNOLOGY",
        secIp: "KBVISION 4K & WI-FI IP CAMERAS",
        secAnalog: "KBVISION HD-CVI ANALOG CAMERAS",
        secDauGhi: "KBVISION DVR / NVR RECORDERS",
        secKit: "KBVISION COMPLETE CAMERA KITS",
        btnBuyNow: "Buy Now",
        searchPlaceholder: "Search products..."
    }
};

// Switch Language Selector
function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('kbvision_lang', lang);
    applyLanguage(lang);
}

function applyLanguage(lang) {
    const t = translations[lang] || translations.vi;

    // Update Header Language Dropdown Label
    const label = document.getElementById('currentLangLabel');
    if (label) {
        label.innerHTML = lang === 'en' 
            ? 'ENGLISH 🇲🇾 <i class="fa-solid fa-chevron-down nav-arrow"></i>' 
            : 'TIẾNG VIỆT 🇻🇳 <i class="fa-solid fa-chevron-down nav-arrow"></i>';
    }

    // Update Top Warranty Text
    const topW = document.getElementById('topWarrantyText');
    if (topW) topW.textContent = t.topWarranty;

    // Update Nav Menu Links
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

    // Update Hero Banner Text
    const heroH1 = document.querySelector('.hero-kb-text h1');
    const heroP = document.querySelector('.hero-kb-text p');
    if (heroH1) heroH1.innerHTML = lang === 'en' ? 'TOTAL <span>Security Solutions</span>' : 'GIẢI PHÁP <span>An Ninh Tổng Thể</span>';
    if (heroP) heroP.textContent = t.heroSub;

    // Update Tabs
    const tabP = document.getElementById('tabBtnProducts');
    const tabT = document.getElementById('tabBtnTech');
    if (tabP) tabP.textContent = t.tabProducts;
    if (tabT) tabT.textContent = t.tabTech;

    // Update Section Headings
    const secIp = document.querySelector('#section-camera-ip h2');
    const secAnalog = document.querySelector('#section-camera-analog h2');
    const secDauGhi = document.querySelector('#section-dau-ghi h2');
    const secKit = document.querySelector('#section-bo-tron-goi h2');

    if (secIp) secIp.textContent = t.secIp;
    if (secAnalog) secAnalog.textContent = t.secAnalog;
    if (secDauGhi) secDauGhi.textContent = t.secDauGhi;
    if (secKit) secKit.textContent = t.secKit;

    // Update Search Input Placeholder
    const searchIn = document.getElementById('searchInput');
    if (searchIn) searchIn.placeholder = t.searchPlaceholder;

    // Re-render product grid buttons
    renderCategorizedHomepage(allProducts);

    showToast(lang === 'en' ? 'Switched interface to English' : 'Đã chuyển sang tiếng Việt');
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

    // Login Form Submission
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
                localStorage.setItem('kbvision_user', JSON.stringify(result.user));
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

    // Register Form Submission (Họ tên, Username, Password, Email, Phone)
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
                localStorage.setItem('kbvision_user', JSON.stringify(result.user));
                checkLoggedInUser();
                modal?.classList.remove('active');
                formReg.reset();
                showToast(`Chúc mừng ${result.user.full_name}! Đã tạo tài khoản thành công.`, 'success');
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
    const userStr = localStorage.getItem('kbvision_user');
    const container = document.getElementById('userHeaderAuth');
    if (!container) return;

    if (userStr) {
        const user = JSON.parse(userStr);
        container.innerHTML = `
            <span style="font-weight:700; color:#ffffff;"><i class="fa-solid fa-circle-user"></i> ${user.full_name}</span>
            <a href="javascript:void(0)" onclick="userLogout()" style="color:#f87171; margin-left:10px;"><i class="fa-solid fa-right-from-bracket"></i> Đăng Xuất</a>
            <a href="admin.html" style="color:#94a3b8; margin-left:12px;"><i class="fa-solid fa-user-shield"></i> Admin</a>
        `;
    } else {
        container.innerHTML = `
            <a href="javascript:void(0)" onclick="openAuthModal()"><i class="fa-solid fa-user"></i> Đăng Nhập / Đăng Ký</a>
            <a href="admin.html" style="color:#94a3b8; margin-left:12px;"><i class="fa-solid fa-user-shield"></i> Admin</a>
        `;
    }
}

function userLogout() {
    localStorage.removeItem('kbvision_user');
    checkLoggedInUser();
    showToast('Đã đăng xuất tài khoản thành công!');
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
        if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm KBVISION');
        
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

    let catName = 'TẤT CẢ SẢN PHẨM KBVISION';
    if (category === 'camera-ip') catName = 'CAMERA IP KBVISION 4K';
    if (category === 'camera-analog') catName = 'CAMERA HD-CVI ANALOG';
    if (category === 'dau-ghi') catName = 'ĐẦU GHI HÌNH KBVISION';
    if (category === 'bo-tron-goi') catName = 'BỘ KIT CAMERA TRỌN GÓI';

    if (search) {
        if (title) title.textContent = `KẾT QUẢ TÌM KIẾM KBVISION: "${search}"`;
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
                    <img src="${p.image}" alt="${p.name}" loading="lazy">
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
                    <a href="https://zalo.me/0987654321" target="_blank" class="btn-card-zalo">Zalo</a>
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
    localStorage.setItem('kbvision_cart', JSON.stringify(cart));
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
                <p>Chưa có sản phẩm nào trong giỏ hàng KBVISION.</p>
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

// Cart & Checkout Modals
function setupCartControls() {
    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    
    document.getElementById('openCartBtn')?.addEventListener('click', () => {
        cartModal?.classList.add('active');
    });

    document.getElementById('closeCartBtn')?.addEventListener('click', () => {
        cartModal?.classList.remove('active');
    });

    document.getElementById('proceedCheckoutBtn')?.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast('Giỏ hàng đang trống!', 'warning');
            return;
        }
        cartModal?.classList.remove('active');
        checkoutModal?.classList.add('active');
    });

    document.getElementById('closeCheckoutBtn')?.addEventListener('click', () => {
        checkoutModal?.classList.remove('active');
    });

    // Checkout Form Submit
    document.getElementById('checkoutForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const orderData = {
            customer_name: document.getElementById('orderName').value.trim(),
            customer_phone: document.getElementById('orderPhone').value.trim(),
            customer_address: document.getElementById('orderAddress').value.trim(),
            note: document.getElementById('orderNote').value.trim(),
            items: cart,
            total_amount: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0),
            payment_method: 'COD'
        };

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const result = await res.json();
            if (result.success) {
                cart = [];
                saveCart();
                updateCartUI();
                checkoutModal?.classList.remove('active');
                showToast(`Đặt hàng thành công! Mã đơn hàng KBVISION: ${result.orderId}`, 'success');
            } else {
                throw new Error(result.error || 'Đặt hàng thất bại');
            }
        } catch (err) {
            showToast('Lỗi đặt hàng: ' + err.message, 'error');
        }
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
                showToast('Đã gửi yêu cầu tư vấn khảo sát thành công! Nhân viên sẽ gọi lại tư vấn.', 'success');
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
