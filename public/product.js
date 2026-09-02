/* ==========================================================================
   Tuấn Camera Standalone Product Detail Page Logic (product.js)
   ========================================================================== */

let currentProduct = null;
let allProductsList = [];
let cart = JSON.parse(localStorage.getItem('tuancamera_cart') || '[]');

document.addEventListener('DOMContentLoaded', () => {
    initProductDetailPage();
    setupCartControls();
    updateCartUI();
});

async function initProductDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        renderProductError("Không tìm thấy mã sản phẩm Tuấn Camera.");
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
            renderProductError("Sản phẩm Tuấn Camera không tồn tại hoặc đã ngưng kinh doanh.");
            return;
        }

        document.title = `${currentProduct.name} - Tuấn Camera`;
        const bTitle = document.getElementById('breadcrumbName');
        if (bTitle) bTitle.textContent = currentProduct.name;

        renderProductDetails(currentProduct);
    } catch (err) {
        console.error(err);
        renderProductError("Lỗi kết nối máy chủ: " + err.message);
    }
}

function renderProductDetails(p) {
    const imgEl = document.getElementById('detailImage');
    const titleEl = document.getElementById('detailTitle');
    const priceEl = document.getElementById('detailPrice');
    const oldPriceEl = document.getElementById('detailOldPrice');
    const ratingEl = document.getElementById('detailRating');
    const specsBody = document.getElementById('detailSpecsBody');
    const descText = document.getElementById('detailDescriptionText');
    const buyBtn = document.getElementById('detailBuyBtn');

    if (imgEl) {
        imgEl.src = p.image;
        imgEl.alt = p.name;
    }
    if (titleEl) titleEl.textContent = p.name;
    if (priceEl) priceEl.textContent = new Intl.NumberFormat('vi-VN').format(p.price) + ' đ';

    if (oldPriceEl) {
        if (p.original_price && p.original_price > p.price) {
            oldPriceEl.textContent = new Intl.NumberFormat('vi-VN').format(p.original_price) + ' đ';
            oldPriceEl.style.display = 'inline';
        } else {
            oldPriceEl.style.display = 'none';
        }
    }

    if (ratingEl) {
        ratingEl.textContent = `${p.rating || '5.0'} (${p.reviews_count || 45} đánh giá từ khách hàng Tuấn Camera)`;
    }

    if (descText) {
        descText.textContent = p.description || `Sản phẩm ${p.name} chính hãng phân phối tại Tuấn Camera. Bảo hành 24 tháng 1 đổi 1 tận nơi.`;
    }

    // Render specs table
    if (specsBody) {
        let specsObj = {};
        if (p.specs_json) {
            try {
                specsObj = typeof p.specs_json === 'string' ? JSON.parse(p.specs_json) : p.specs_json;
            } catch (e) {
                specsObj = { "Thông Số": p.specs_json };
            }
        }

        const keys = Object.keys(specsObj);
        if (keys.length === 0) {
            specsBody.innerHTML = '<tr><td colspan="2">Thông số kỹ thuật đang cập nhật...</td></tr>';
        } else {
            specsBody.innerHTML = keys.map(k => `
                <tr>
                    <td>${k}</td>
                    <td>${specsObj[k]}</td>
                </tr>
            `).join('');
        }
    }

    if (buyBtn) {
        buyBtn.onclick = () => {
            addToCart(p.id);
        };
    }
}

function renderProductError(msg) {
    const container = document.getElementById('productDetailContainer');
    if (container) {
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:50px 20px;">
                <h2 style="color:var(--accent-red); margin-bottom:15px;">Rất Tiếc!</h2>
                <p style="color:var(--text-muted); margin-bottom:20px;">${msg}</p>
                <a href="index.html" class="btn-kb-primary">Quay Về Trang Chủ Tuấn Camera</a>
            </div>
        `;
    }
}

function addToCart(productId) {
    if (!currentProduct) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    showToast(`Đã thêm "${currentProduct.name}" vào giỏ hàng!`);
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
}

function setupCartControls() {
    const cartModal = document.getElementById('cartModal');
    document.getElementById('openCartBtn')?.addEventListener('click', () => {
        cartModal?.classList.add('active');
    });
}

function showToast(message) {
    alert(message);
}
