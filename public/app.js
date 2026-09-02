/* ==========================================================================
   KBVISION.vn Storefront App Logic (Connected to Cloudflare Workers & D1)
   ========================================================================== */

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('kbvision_cart') || '[]');

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupSearch();
    setupCartControls();
    setupCustomBuildForm();
    setupTabs();
    updateCartUI();
});

// Switch Language Selector
function switchLanguage(lang) {
    const label = document.getElementById('currentLangLabel');
    if (lang === 'en') {
        if (label) label.innerHTML = 'ENGLISH 🇲🇾 <i class="fa-solid fa-chevron-down nav-arrow"></i>';
        showToast('Switched to English language mode');
    } else {
        if (label) label.innerHTML = 'TIẾNG VIỆT 🇻🇳 <i class="fa-solid fa-chevron-down nav-arrow"></i>';
        showToast('Đã chuyển sang chế độ Tiếng Việt');
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
        if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm KBVISION');
        
        allProducts = await res.json();

        if (category === 'all' && !search) {
            // Show Categorized Homepage Sections
            document.getElementById('categorized-sections-container').style.display = 'block';
            document.getElementById('filtered-view-section').style.display = 'none';
            renderCategorizedHomepage(allProducts);
        } else {
            // Show Filtered / Search View
            document.getElementById('categorized-sections-container').style.display = 'none';
            document.getElementById('filtered-view-section').style.display = 'block';
            renderFilteredGrid(allProducts, category, search);
        }
    } catch (err) {
        console.error('API Error:', err);
        showToast('Lỗi tải sản phẩm: ' + err.message, 'error');
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

// Render Product Cards to target container ID (Clean Corporate Design)
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
                    <button class="btn-card-buy" onclick="addToCart('${p.id}')">Mua Ngay</button>
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
