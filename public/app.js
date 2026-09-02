/* ==========================================================================
   KBVISION.vn Storefront App Logic (Connected to Cloudflare Workers & D1)
   ========================================================================== */

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('kbvision_cart') || '[]');

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    setupCategoryFilters();
    setupSearch();
    setupCartControls();
    setupCustomBuildForm();
    updateCartUI();
});

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
    const featured = products.filter(p => p.featured === 1 || p.badge === 'BEST SELLER' || p.badge === 'CHÍNH HÃNG USA' || p.badge === 'BÁN CHẠY #1').slice(0, 8);
    const cameraIp = products.filter(p => p.category_id === 'camera-ip').slice(0, 8);
    const cameraAnalog = products.filter(p => p.category_id === 'camera-analog').slice(0, 8);
    const dauGhi = products.filter(p => p.category_id === 'dau-ghi').slice(0, 8);
    const boTronGoi = products.filter(p => p.category_id === 'bo-tron-goi').slice(0, 8);

    renderProductCardsToGrid('grid-featured', featured.length > 0 ? featured : products.slice(0, 8));
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

    let catName = 'Tất Cả Sản Phẩm KBVISION';
    if (category === 'camera-ip') catName = 'Camera IP KBVISION 4K';
    if (category === 'camera-analog') catName = 'Camera HD-CVI Analog KBVISION';
    if (category === 'dau-ghi') catName = 'Đầu Ghi Hình KBVISION (NVR/DVR)';
    if (category === 'bo-tron-goi') catName = 'Bộ Kit Camera Trọn Gói KBVISION';

    if (search) {
        if (title) title.innerHTML = `<i class="fa-solid fa-magnifying-glass" style="color:var(--primary)"></i> Kết Quả Tìm Kiếm KBVISION: "${search}"`;
    } else {
        if (title) title.innerHTML = `<i class="fa-solid fa-list-check" style="color:var(--primary)"></i> Danh Mục: ${catName}`;
    }

    if (label) label.textContent = `${products.length} sản phẩm phù hợp`;

    renderProductCardsToGrid(gridId, products);
}

// Generic Helper: Render Product Cards to target container ID
function renderProductCardsToGrid(gridId, productsList) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    if (!productsList || productsList.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 30px; color: var(--text-muted);">
                <i class="fa-solid fa-box-open" style="font-size:2.5rem; margin-bottom:10px; display:block;"></i>
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
                    ${p.badge ? `<span class="product-badge ${p.badge_type || 'hot'}">${p.badge}</span>` : ''}
                </div>
                <div class="product-body">
                    <div class="product-rating">
                        ${'<i class="fa-solid fa-star"></i>'.repeat(Math.floor(p.rating || 5))}
                        <span>${p.rating || 5.0} (${p.reviews_count || 0})</span>
                    </div>
                    <h3 class="product-title" onclick="openProductDetail('${p.id}')" style="cursor:pointer;" title="Xem chi tiết sản phẩm">${p.name}</h3>
                    <div class="product-price">
                        <span class="price-current">${formattedPrice}</span>
                        ${formattedOldPrice ? `<span class="price-old">${formattedOldPrice}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="addToCart('${p.id}')">
                            <i class="fa-solid fa-cart-plus"></i> Mua Ngay
                        </button>
                        <a href="https://zalo.me/0987654321" target="_blank" class="btn-zalo-consult">
                            <i class="fa-solid fa-comment-dots"></i> Zalo
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Category Navigation Select
function selectCategory(cat) {
    const nav = document.getElementById('categoryNav');
    if (nav) {
        nav.querySelectorAll('.category-pill').forEach(b => {
            if (b.dataset.category === cat) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
    }
    fetchProducts(cat);
    window.scrollTo({ top: 400, behavior: 'smooth' });
}

// Category Filter Tabs Event Setup
function setupCategoryFilters() {
    const nav = document.getElementById('categoryNav');
    if (!nav) return;

    nav.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-pill');
        if (!btn) return;

        nav.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.dataset.category;
        fetchProducts(cat);
    });
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
                const activeCat = document.querySelector('.category-pill.active')?.dataset.category || 'all';
                fetchProducts(activeCat, input.value.trim());
            }, 300);
        });
    }

    if (btn) {
        btn.addEventListener('click', () => {
            const activeCat = document.querySelector('.category-pill.active')?.dataset.category || 'all';
            fetchProducts(activeCat, input.value.trim());
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
                <i class="fa-solid fa-cart-arrow-down" style="font-size:2.5rem; margin-bottom:10px;"></i>
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
            <div class="cart-item">
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <h4 style="font-size:0.9rem; font-weight:700;">${item.name}</h4>
                        <span style="color:var(--primary); font-size:0.85rem; font-weight:800;">
                            ${new Intl.NumberFormat('vi-VN').format(item.price)} đ
                        </span>
                    </div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                    <span style="font-weight:700; font-size:0.9rem;">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
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

// Custom Camera Installation Quote Form Submit
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
                showToast('Đã gửi yêu cầu tư vấn khảo sát KBVISION thành công! Nhân viên sẽ gọi Zalo báo giá cụ thể.', 'success');
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
    let icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-xmark';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}" style="color:var(--primary)"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}
