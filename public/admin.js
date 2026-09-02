/* ==========================================================================
   CameraMini.vn Admin Panel Logic (Cloudflare Workers & D1 Integration)
   ========================================================================== */

let adminToken = localStorage.getItem('cf_admin_token') || null;
let adminProductsList = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    setupAdminLogin();
    setupAdminNavigation();
    setupAddProductModal();
    setupEditProductModal();
});

// Secure API Fetch Wrapper with Token Authorization & 401 handling
async function fetchAdmin(url, options = {}) {
    options.headers = options.headers || {};
    if (adminToken) {
        options.headers['Authorization'] = `Bearer ${adminToken}`;
    }
    const res = await fetch(url, options);
    if (res.status === 401) {
        handleUnauthorized();
        throw new Error('Phiên làm việc hết hạn hoặc không hợp lệ.');
    }
    return res;
}

function handleUnauthorized() {
    adminToken = null;
    localStorage.removeItem('cf_admin_token');

    const loginSec = document.getElementById('loginSection');
    const dashSec = document.getElementById('adminDashboard');
    if (loginSec) loginSec.style.display = 'block';
    if (dashSec) dashSec.style.display = 'none';

    // Clear sensitive table content from DOM
    const prodTable = document.getElementById('adminProductsTable');
    const orderTable = document.getElementById('adminOrdersTable');
    const customTable = document.getElementById('adminCustomTable');
    if (prodTable) prodTable.innerHTML = '';
    if (orderTable) orderTable.innerHTML = '';
    if (customTable) customTable.innerHTML = '';
}

async function checkAdminAuth() {
    const loginSec = document.getElementById('loginSection');
    const dashSec = document.getElementById('adminDashboard');

    if (!adminToken) {
        handleUnauthorized();
        return;
    }

    try {
        const res = await fetchAdmin('/api/admin/verify');
        const data = await res.json();
        if (data.success) {
            loginSec.style.display = 'none';
            dashSec.style.display = 'grid';
            loadDashboardData();
        } else {
            handleUnauthorized();
        }
    } catch (err) {
        handleUnauthorized();
    }
}

// Admin Login Form
function setupAdminLogin() {
    const form = document.getElementById('adminLoginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('adminUser').value.trim();
        const password = document.getElementById('adminPass').value.trim();

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await res.json();
            if (result.success) {
                adminToken = result.token;
                localStorage.setItem('cf_admin_token', adminToken);
                showAdminToast('Đăng nhập thành công!', 'success');
                checkAdminAuth();
            } else {
                showAdminToast(result.error || 'Đăng nhập thất bại', 'error');
            }
        } catch (err) {
            showAdminToast('Lỗi kết nối server: ' + err.message, 'error');
        }
    });

    document.getElementById('adminLogoutBtn')?.addEventListener('click', () => {
        handleUnauthorized();
        showAdminToast('Đã đăng xuất tài khoản admin');
    });
}

// Dashboard Data Loading
async function loadDashboardData() {
    await Promise.all([
        loadAdminProducts().catch(() => {}),
        loadAdminOrders().catch(() => {}),
        loadAdminCustomRequests().catch(() => {})
    ]);
}

// Load Products Table
async function loadAdminProducts() {
    const tbody = document.getElementById('adminProductsTable');
    if (!tbody) return;

    try {
        const res = await fetchAdmin('/api/admin/products');
        adminProductsList = await res.json();

        document.getElementById('statProductCount').textContent = adminProductsList.length;

        if (adminProductsList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Chưa có sản phẩm nào trong D1.</td></tr>';
            return;
        }

        tbody.innerHTML = adminProductsList.map(p => {
            const formattedPrice = new Intl.NumberFormat('vi-VN').format(p.price) + ' đ';
            return `
                <tr>
                    <td><img src="${p.image}" alt="" style="width:40px; height:40px; border-radius:6px; object-fit:cover;"></td>
                    <td><strong>${p.name}</strong></td>
                    <td><span class="brand-tag">${p.category_id}</span></td>
                    <td style="color:var(--primary); font-weight:700;">${formattedPrice}</td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            <button class="btn-primary" onclick="openEditProductModal('${p.id}')" style="padding:5px 12px; font-size:0.78rem; background:var(--secondary-navy);">
                                <i class="fa-solid fa-pen-to-square"></i> Sửa
                            </button>
                            <button class="btn-secondary" onclick="deleteProduct('${p.id}')" style="padding:5px 12px; font-size:0.78rem; color:var(--accent-red); border-color:#fca5a5;">
                                <i class="fa-solid fa-trash"></i> Xoá
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="5" style="color:var(--accent-red);">Lỗi tải sản phẩm từ D1</td></tr>';
    }
}

// Delete Product
async function deleteProduct(id) {
    if (!confirm('Bạn có chắc chắn muốn xoá sản phẩm này khỏi Cloudflare D1?')) return;

    try {
        const res = await fetchAdmin(`/api/admin/products/${id}`, {
            method: 'DELETE'
        });
        const result = await res.json();
        if (result.success) {
            showAdminToast('Đã xoá sản phẩm thành công!', 'success');
            loadAdminProducts();
        } else {
            showAdminToast(result.error || 'Xoá thất bại', 'error');
        }
    } catch (err) {
        showAdminToast('Lỗi xoá sản phẩm: ' + err.message, 'error');
    }
}

// Add Product Modal & Submit
function setupAddProductModal() {
    const modal = document.getElementById('addProductModal');
    const openBtn = document.getElementById('openAddProductBtn');
    const closeBtn = document.getElementById('closeAddProductBtn');
    const form = document.getElementById('addProductForm');

    openBtn?.addEventListener('click', () => modal?.classList.add('active'));
    closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const prodData = {
            name: document.getElementById('newProdName').value.trim(),
            category_id: document.getElementById('newProdCat').value,
            price: parseInt(document.getElementById('newProdPrice').value) || 0,
            original_price: parseInt(document.getElementById('newProdOldPrice').value) || 0,
            badge: document.getElementById('newProdBadge').value.trim(),
            badge_type: 'hot',
            image: document.getElementById('newProdImg').value.trim(),
            description: document.getElementById('newProdDesc').value.trim(),
            specs: { resolution: "Full HD / 4K", battery: "Pin sạc", connection: "Wi-Fi Xem từ xa" }
        };

        try {
            const res = await fetchAdmin('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prodData)
            });

            const result = await res.json();
            if (result.success) {
                form.reset();
                modal?.classList.remove('active');
                showAdminToast('Đã thêm sản phẩm mới vào Cloudflare D1!', 'success');
                loadAdminProducts();
            } else {
                showAdminToast(result.error || 'Thêm sản phẩm thất bại', 'error');
            }
        } catch (err) {
            showAdminToast('Lỗi gửi sản phẩm: ' + err.message, 'error');
        }
    });
}

// Edit Product Modal & Submit
function setupEditProductModal() {
    const modal = document.getElementById('editProductModal');
    const closeBtn = document.getElementById('closeEditProductBtn');
    const form = document.getElementById('editProductForm');

    closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editProdId').value;
        const prodData = {
            name: document.getElementById('editProdName').value.trim(),
            category_id: document.getElementById('editProdCat').value,
            price: parseInt(document.getElementById('editProdPrice').value) || 0,
            original_price: parseInt(document.getElementById('editProdOldPrice').value) || 0,
            badge: document.getElementById('editProdBadge').value.trim(),
            image: document.getElementById('editProdImg').value.trim(),
            description: document.getElementById('editProdDesc').value.trim()
        };

        try {
            const res = await fetchAdmin(`/api/admin/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prodData)
            });

            const result = await res.json();
            if (result.success) {
                modal?.classList.remove('active');
                showAdminToast('Đã cập nhật thông tin sản phẩm thành công!', 'success');
                loadAdminProducts();
            } else {
                showAdminToast(result.error || 'Cập nhật thất bại', 'error');
            }
        } catch (err) {
            showAdminToast('Lỗi cập nhật sản phẩm: ' + err.message, 'error');
        }
    });
}

// Open Edit Product Modal with prefilled values
function openEditProductModal(productId) {
    const p = adminProductsList.find(item => item.id === productId);
    if (!p) return;

    document.getElementById('editProdId').value = p.id;
    document.getElementById('editProdName').value = p.name;
    document.getElementById('editProdCat').value = p.category_id;
    document.getElementById('editProdPrice').value = p.price;
    document.getElementById('editProdOldPrice').value = p.original_price || '';
    document.getElementById('editProdBadge').value = p.badge || '';
    document.getElementById('editProdImg').value = p.image;
    document.getElementById('editProdDesc').value = p.description;

    const modal = document.getElementById('editProductModal');
    modal?.classList.add('active');
}

// Load Orders Table
async function loadAdminOrders() {
    const tbody = document.getElementById('adminOrdersTable');
    if (!tbody) return;

    try {
        const res = await fetchAdmin('/api/admin/orders');
        const orders = await res.json();

        document.getElementById('statOrderCount').textContent = orders.length;

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Chưa có đơn hàng nào.</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(o => {
            const formattedTotal = new Intl.NumberFormat('vi-VN').format(o.total_amount) + ' đ';
            return `
                <tr>
                    <td><strong style="color:var(--primary);">${o.id}</strong></td>
                    <td>${o.customer_name}</td>
                    <td><a href="tel:${o.customer_phone}">${o.customer_phone}</a></td>
                    <td>${o.customer_address}</td>
                    <td style="font-weight:700;">${formattedTotal}</td>
                    <td><span class="product-badge hot">${o.status}</span></td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="6" style="color:var(--accent-red);">Lỗi tải đơn hàng</td></tr>';
    }
}

// Load Custom Requests Table
async function loadAdminCustomRequests() {
    const tbody = document.getElementById('adminCustomTable');
    if (!tbody) return;

    try {
        const res = await fetchAdmin('/api/admin/custom-requests');
        const reqs = await res.json();

        document.getElementById('statCustomCount').textContent = reqs.length;

        if (reqs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Chưa có yêu cầu độ chế nào.</td></tr>';
            return;
        }

        tbody.innerHTML = reqs.map(r => `
            <tr>
                <td><strong style="color:var(--accent-green);">${r.id}</strong></td>
                <td>${r.customer_name}</td>
                <td><a href="https://zalo.me/${r.customer_phone}" target="_blank" style="color:#0284c7; font-weight:700;"><i class="fa-solid fa-comment-dots"></i> ${r.customer_phone}</a></td>
                <td><strong>${r.target_item}</strong></td>
                <td>${r.resolution} / ${r.battery_type}</td>
                <td><span class="product-badge new">${r.status}</span></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="6" style="color:var(--accent-red);">Lỗi tải yêu cầu độ chế</td></tr>';
    }
}

// Admin Navigation Tabs
function setupAdminNavigation() {
    const menuItems = document.querySelectorAll('.admin-menu-item[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.dataset.tab;
            menuItems.forEach(m => m.classList.remove('active'));
            item.classList.add('active');

            tabContents.forEach(tab => {
                if (tab.id === targetTab) {
                    tab.style.display = 'block';
                } else {
                    tab.style.display = 'none';
                }
            });
        });
    });
}

// Admin Toast Notifications
function showAdminToast(message, type = 'info') {
    const container = document.getElementById('adminToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    let icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-xmark';

    toast.innerHTML = `<i class="fa-solid ${icon}" style="color:var(--primary)"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}
