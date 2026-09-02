/* ==========================================================================
   CameraMini.vn Storefront App Logic (Connected to Cloudflare Workers & D1)
   ========================================================================== */

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('cameramini_cart') || '[]');

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
    const label = document.getElementById('productCountLabel');
    if (label) label.textContent = 'Đang tải dữ liệu từ Cloudflare D1...';

    try {
        let url = '/api/products';
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (search) params.append('search', search);
        if (params.toString()) url += '?' + params.toString();

        const res = await fetch(url);
        if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm');
        
        allProducts = await res.json();
        renderProducts(allProducts);

        if (label) {
            label.textContent = `Hiển thị ${allProducts.length} sản phẩm`;
        }
    } catch (err) {
        console.error('API Error:', err);
        showToast('Lỗi tải sản phẩm: ' + err.message, 'error');
        if (label) label.textContent = 'Lỗi kết nối cơ sở dữ liệu';
    }
}

// Render Product Cards
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (!products || products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-box-open" style="font-size:3rem; margin-bottom:15px; display:block;"></i>
                <p>Không tìm thấy sản phẩm nào phù hợp.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(p => {
        const specs = typeof p.specs_json === 'string' ? JSON.parse(p.specs_json || '{}') : (p.specs_json || {});
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

// Category Filter Tabs
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

// Live Search
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
    localStorage.setItem('cameramini_cart', JSON.stringify(cart));
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
                <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
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
                showToast(`Đặt hàng thành công! Mã đơn hàng: ${result.orderId}`, 'success');
            } else {
                throw new Error(result.error || 'Đặt hàng thất bại');
            }
        } catch (err) {
            showToast('Lỗi đặt hàng: ' + err.message, 'error');
        }
    });
}

// Custom Camera Form Submit
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
            estimated_price: 2200000
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
                showToast('Đã gửi yêu cầu độ chế camera thành công! Nhân viên sẽ gọi Zalo báo giá cụ thể.', 'success');
            } else {
                throw new Error(result.error || 'Gửi thất bại');
            }
        } catch (err) {
            showToast('Lỗi gửi yêu cầu: ' + err.message, 'error');
        }
    });
}

// Product Quick View Detail Modal + Recommended Related Products
function openProductDetail(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('productDetailModal');
    const content = document.getElementById('productDetailContent');
    if (!modal || !content) return;

    const specs = typeof product.specs_json === 'string' ? JSON.parse(product.specs_json || '{}') : (product.specs_json || {});
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(product.price) + ' đ';
    const formattedOldPrice = product.original_price ? new Intl.NumberFormat('vi-VN').format(product.original_price) + ' đ' : '';

    // Recommended Related Products (Other products)
    const relatedProducts = allProducts.filter(p => p.id !== productId).slice(0, 3);

    content.innerHTML = `
        <button class="modal-close" onclick="document.getElementById('productDetailModal').classList.remove('active')"><i class="fa-solid fa-xmark"></i></button>
        <div style="display:grid; grid-template-columns: 1fr 1.1fr; gap:25px; align-items:start; margin-bottom:30px;">
            <div>
                <img src="${product.image}" alt="${product.name}" style="width:100%; border-radius:var(--radius-md); border:1px solid var(--border-color); box-shadow:var(--shadow-subtle);">
            </div>
            <div>
                <h2 style="font-size:1.4rem; font-weight:800; color:var(--secondary-navy); margin-bottom:10px; line-height:1.3;">${product.name}</h2>
                <div style="display:flex; align-items:baseline; gap:10px; margin-bottom:15px;">
                    <span style="font-size:1.5rem; font-weight:900; color:var(--primary);">${formattedPrice}</span>
                    ${formattedOldPrice ? `<span style="font-size:0.9rem; color:var(--text-muted); text-decoration:line-through;">${formattedOldPrice}</span>` : ''}
                </div>
                <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:20px; line-height:1.5;">${product.description}</p>
                
                <h4 style="font-size:0.95rem; font-weight:800; color:var(--secondary-navy); margin-bottom:10px;">Thông số kỹ thuật sản phẩm:</h4>
                <ul style="list-style:none; font-size:0.85rem; color:var(--text-secondary); margin-bottom:25px; background:#f8fafc; padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                    ${Object.entries(specs).map(([k, v]) => `<li style="margin-bottom:6px;"><i class="fa-solid fa-circle-check" style="color:var(--primary); margin-right:6px;"></i> <strong>${k}:</strong> ${v}</li>`).join('')}
                </ul>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <button class="btn-primary" onclick="addToCart('${product.id}'); document.getElementById('productDetailModal').classList.remove('active');" style="justify-content:center; padding:12px;">
                        <i class="fa-solid fa-cart-plus"></i> Đặt Mua Ngay
                    </button>
                    <a href="https://zalo.me/0987654321" target="_blank" class="btn-secondary" style="justify-content:center; padding:12px;">
                        <i class="fa-solid fa-comment-dots"></i> Tư Vấn Zalo 24/7
                    </a>
                </div>
            </div>
        </div>

        <!-- Recommended Related Products Grid -->
        ${relatedProducts.length > 0 ? `
            <div style="border-top:2px solid var(--border-color); padding-top:20px;">
                <h3 style="font-size:1.1rem; font-weight:800; color:var(--secondary-navy); margin-bottom:15px;">
                    🔥 Gợi Ý Sản Phẩm Khác Dành Cho Bạn
                </h3>
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px;">
                    ${relatedProducts.map(rp => `
                        <div onclick="openProductDetail('${rp.id}')" style="background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:10px; cursor:pointer; text-align:center; transition:border 0.2s;">
                            <img src="${rp.image}" alt="" style="width:100%; height:90px; object-fit:cover; border-radius:4px; margin-bottom:8px;">
                            <h4 style="font-size:0.78rem; font-weight:700; color:var(--secondary-navy); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; height:2.5em;">${rp.name}</h4>
                            <div style="color:var(--primary); font-size:0.85rem; font-weight:900; margin-top:4px;">${new Intl.NumberFormat('vi-VN').format(rp.price)} đ</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;

    modal.classList.add('active');
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
