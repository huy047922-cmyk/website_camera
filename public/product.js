/* ==========================================================================
   KBVISION.vn Standalone Product Detail Page Logic (product.js)
   ========================================================================== */

let currentProduct = null;
let allProductsList = [];
let cart = JSON.parse(localStorage.getItem('kbvision_cart') || '[]');

document.addEventListener('DOMContentLoaded', () => {
    initProductDetailPage();
    setupCartControls();
    updateCartUI();
});

async function initProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        renderProductError("Không tìm thấy mã sản phẩm KBVISION.");
        return;
    }

    try {
        const [prodRes, listRes] = await Promise.all([
            fetch(`/api/products/${productId}`),
            fetch('/api/products')
        ]);

        if (prodRes.ok) {
            currentProduct = await prodRes.json();
        }

        if (listRes.ok) {
            allProductsList = await listRes.json();
        }

        if (!currentProduct && allProductsList.length > 0) {
            currentProduct = allProductsList.find(p => p.id === productId);
        }

        if (!currentProduct) {
            renderProductError("Sản phẩm KBVISION không tồn tại hoặc đã ngưng kinh doanh.");
            return;
        }

        // Update page title & breadcrumb
        document.title = `${currentProduct.name} - KBVISION.vn`;
        const bTitle = document.getElementById('breadcrumbTitle');
        if (bTitle) bTitle.textContent = currentProduct.name;

        renderProductMainDetail(currentProduct);
        renderFullSpecsAndDescription(currentProduct);
        renderRelatedProducts(currentProduct, allProductsList);

    } catch (err) {
        console.error(err);
        renderProductError("Lỗi kết nối máy chủ: " + err.message);
    }
}

function renderProductError(msg) {
    const container = document.getElementById('productDetailContainer');
    if (container) {
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:50px;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size:3rem; color:var(--primary); margin-bottom:15px;"></i>
                <h2 style="font-size:1.4rem; font-weight:800; color:var(--secondary-navy); margin-bottom:10px;">${msg}</h2>
                <a href="index.html" class="btn-primary" style="margin-top:15px;"><i class="fa-solid fa-arrow-left"></i> Quay Về Trang Chủ KBVISION</a>
            </div>
        `;
    }
}

function renderProductMainDetail(p) {
    const container = document.getElementById('productDetailContainer');
    if (!container) return;

    const formattedPrice = new Intl.NumberFormat('vi-VN').format(p.price) + ' đ';
    const formattedOldPrice = p.original_price ? new Intl.NumberFormat('vi-VN').format(p.original_price) + ' đ' : '';
    const discountPercent = p.original_price ? Math.round((1 - (p.price / p.original_price)) * 100) : 0;

    let catLabel = 'CAMERA KBVISION';
    if (p.category_id === 'camera-ip') catLabel = 'CAMERA IP 4K KBVISION';
    if (p.category_id === 'camera-analog') catLabel = 'CAMERA HD-CVI ANALOG';
    if (p.category_id === 'dau-ghi') catLabel = 'ĐẦU GHI HÌNH KBVISION';
    if (p.category_id === 'bo-tron-goi') catLabel = 'BỘ KIT CAMERA TRỌN GÓI';

    container.innerHTML = `
        <div class="detail-img-wrap">
            <img src="${p.image}" alt="${p.name}">
            ${p.badge ? `<span class="product-badge ${p.badge_type || 'hot'}" style="font-size:0.85rem; padding:5px 12px;">${p.badge}</span>` : ''}
        </div>

        <div class="detail-info">
            <span style="display:inline-block; background:var(--primary-light); color:var(--primary); font-size:0.78rem; font-weight:800; padding:3px 10px; border-radius:var(--radius-sm); margin-bottom:10px; text-transform:uppercase;">
                <i class="fa-solid fa-certificate"></i> THƯƠNG HIỆU MỸ: ${catLabel}
            </span>
            <h1>${p.name}</h1>
            
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px; font-size:0.88rem; color:#f59e0b;">
                ${'<i class="fa-solid fa-star"></i>'.repeat(Math.floor(p.rating || 5))}
                <span style="color:var(--text-muted); font-weight:600;">${p.rating || 4.9} (${p.reviews_count || 150} đánh giá từ khách mua)</span>
            </div>

            <div class="price-box-detail">
                <span style="font-size:1.8rem; font-weight:900; color:var(--primary);">${formattedPrice}</span>
                ${formattedOldPrice ? `<span style="font-size:1.05rem; color:var(--text-muted); text-decoration:line-through;">${formattedOldPrice}</span>` : ''}
                ${discountPercent > 0 ? `<span style="background:var(--primary); color:#fff; font-size:0.8rem; font-weight:800; padding:2px 8px; border-radius:4px;">-${discountPercent}%</span>` : ''}
            </div>

            <p style="color:var(--text-secondary); font-size:0.95rem; margin-bottom:20px; line-height:1.6;">
                ${p.description}
            </p>

            <div style="background:#f0f9ff; border:1px dashed var(--primary); padding:15px; border-radius:var(--radius-md); margin-bottom:25px;">
                <h4 style="font-size:0.9rem; font-weight:800; color:var(--secondary-navy); margin-bottom:8px;"><i class="fa-solid fa-award" style="color:var(--primary)"></i> CAM KẾT CHÍNH HÃNG KBVISION USA:</h4>
                <ul style="list-style:none; font-size:0.85rem; color:var(--text-secondary);">
                    <li style="margin-bottom:4px;"><i class="fa-solid fa-check" style="color:var(--accent-green)"></i> Bảo hành chính hãng 24 tháng (Lỗi 1 đổi 1 tận nơi)</li>
                    <li style="margin-bottom:4px;"><i class="fa-solid fa-check" style="color:var(--accent-green)"></i> Đầy đủ chứng nhận CO/CQ xuất xứ thương hiệu Mỹ</li>
                    <li><i class="fa-solid fa-check" style="color:var(--accent-green)"></i> Tặng kèm dây cáp & Tài khoản KBView Plus xem từ xa miễn phí trọn đời</li>
                </ul>
            </div>

            <div style="display:grid; grid-template-columns: 1.2fr 1fr 1fr; gap:10px;">
                <button class="btn-primary" onclick="buyNowDirect('${p.id}')" style="justify-content:center; padding:14px; font-size:0.95rem;">
                    <i class="fa-solid fa-bolt"></i> ĐẶT MUA NGAY (COD)
                </button>
                <button class="btn-secondary" onclick="addToCart('${p.id}')" style="background:var(--secondary-dark); justify-content:center; padding:14px; font-size:0.9rem;">
                    <i class="fa-solid fa-cart-plus"></i> Thêm Vào Giỏ
                </button>
                <a href="https://zalo.me/0987654321" target="_blank" class="btn-secondary" style="justify-content:center; padding:14px; font-size:0.9rem;">
                    <i class="fa-solid fa-comment-dots"></i> Tư Vấn Zalo
                </a>
            </div>
        </div>
    `;
}

function renderFullSpecsAndDescription(p) {
    const section = document.getElementById('detailTabsSection');
    const descContent = document.getElementById('fullDescriptionContent');
    const specsTable = document.getElementById('fullSpecsTable');

    if (!section || !descContent || !specsTable) return;

    section.style.display = 'block';

    const specs = typeof p.specs_json === 'string' ? JSON.parse(p.specs_json || '{}') : (p.specs_json || {});

    descContent.innerHTML = `
        <p style="margin-bottom:15px;">Mẫu camera / đầu ghi hình <strong>${p.name}</strong> là sản phẩm thiết bị an ninh cao cấp chính hãng thương hiệu <strong>KBVISION (USA)</strong>. Phù hợp cho nhu cầu giám sát nhà ở, biệt thự, cửa hàng, văn phòng và dự án nhà xưởng lớn.</p>
        
        <h4 style="color:var(--secondary-navy); font-weight:800; font-size:1.05rem; margin:20px 0 10px;">✨ Tính Năng Nổi Bật Dòng Camera KBVISION ${p.name}:</h4>
        <ul style="padding-left:20px; margin-bottom:20px;">
            <li style="margin-bottom:8px;"><strong>Cảm biến hình ảnh Sony 4K / Full HD:</strong> Độ nét vượt trội, tái tạo màu sắc chân thực.</li>
            <li style="margin-bottom:8px;"><strong>Chuẩn nén H.265+:</strong> Tiết kiệm tới 80% dung lượng băng thông và ổ cứng lưu trữ.</li>
            <li style="margin-bottom:8px;"><strong>Tiêu chuẩn chống nước IP67:</strong> Vỏ kim loại siêu bền, chịu thời tiết nắng mưa ngoài trời cực tốt.</li>
            <li style="margin-bottom:8px;"><strong>Công nghệ hồng ngoại Smart IR / Full-Color:</strong> Quan sát rõ nét ban đêm lên tới 30m - 80m.</li>
            <li><strong>Xem từ xa qua App KBView Plus:</strong> Kết nối đám mây tốc độ cao, hỗ trợ xem đồng thời trên điện thoại, máy tính.</li>
        </ul>

        <h4 style="color:var(--secondary-navy); font-weight:800; font-size:1.05rem; margin:20px 0 10px;">📦 Bộ Sản Phẩm Đầy Đủ Bao Gồm:</h4>
        <p>1x Thiết bị ${p.name}, 1x Bộ ốc vít chân đế lắp đặt, 1x Hướng dẫn sử dụng chính hãng KBVISION, 1x Thẻ bảo hành 24 tháng chính hãng KBVISION USA.</p>
    `;

    specsTable.innerHTML = Object.entries(specs).map(([k, v]) => `
        <tr>
            <td>${k}</td>
            <td>${v}</td>
        </tr>
    `).join('') || '<tr><td colspan="2">Đang cập nhật thông số KBVISION...</td></tr>';
}

function renderRelatedProducts(currentP, list) {
    const grid = document.getElementById('relatedProductsGrid');
    if (!grid) return;

    const related = list.filter(item => item.id !== currentP.id && item.category_id === currentP.category_id).slice(0, 4);

    if (related.length === 0) {
        grid.parentElement.style.display = 'none';
        return;
    }

    grid.innerHTML = related.map(rp => {
        const formattedPrice = new Intl.NumberFormat('vi-VN').format(rp.price) + ' đ';
        const formattedOldPrice = rp.original_price ? new Intl.NumberFormat('vi-VN').format(rp.original_price) + ' đ' : '';

        return `
            <div class="product-card">
                <div class="product-thumb" onclick="location.href='product.html?id=${rp.id}'" style="cursor:pointer;">
                    <img src="${rp.image}" alt="${rp.name}" loading="lazy">
                    ${rp.badge ? `<span class="product-badge ${rp.badge_type || 'hot'}">${rp.badge}</span>` : ''}
                </div>
                <div class="product-body">
                    <div class="product-rating">
                        ${'<i class="fa-solid fa-star"></i>'.repeat(Math.floor(rp.rating || 5))}
                        <span>${rp.rating || 4.9}</span>
                    </div>
                    <h3 class="product-title" onclick="location.href='product.html?id=${rp.id}'" style="cursor:pointer;">${rp.name}</h3>
                    <div class="product-price">
                        <span class="price-current">${formattedPrice}</span>
                        ${formattedOldPrice ? `<span class="price-old">${formattedOldPrice}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-add-cart" onclick="location.href='product.html?id=${rp.id}'">
                            <i class="fa-solid fa-eye"></i> Xem Chi Tiết
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

// Direct Buy Action
function buyNowDirect(productId) {
    addToCart(productId);
    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    cartModal?.classList.remove('active');
    checkoutModal?.classList.add('active');
}

// Cart State & Modal Handlers
function addToCart(productId) {
    const product = currentProduct && currentProduct.id === productId ? currentProduct : allProductsList.find(p => p.id === productId);
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
