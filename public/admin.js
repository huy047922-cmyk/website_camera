/* ==========================================================================
   CameraMini.vn Admin Panel Logic (Cloudflare Workers & D1 Integration)
   ========================================================================== */

let adminToken = localStorage.getItem('cf_admin_token') || null;
let adminProductsList = [];
let adminUsersList = [];
let adminNewsList = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    setupAdminLogin();
    setupAdminNavigation();
    setupAddProductModal();
    setupEditProductModal();
    setupAdminProductSearch();
    setupAddNewsModal();
    setupEditNewsModal();
});

// Helper: Convert Specs Object or JSON to Line-by-Line Text
function specsToText(specsJson) {
    if (!specsJson) return '';
    let specsObj = {};
    if (typeof specsJson === 'string') {
        try {
            specsObj = JSON.parse(specsJson);
        } catch (e) {
            return specsJson;
        }
    } else {
        specsObj = specsJson;
    }
    return Object.entries(specsObj).map(([k, v]) => `${k}: ${v}`).join('\n');
}

// Helper: Convert Line-by-Line Text to Specs Object
function textToSpecsObj(text) {
    if (!text || typeof text !== 'string') return {};
    const lines = text.split('\n');
    const specsObj = {};
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.includes(':')) {
            const idx = trimmed.indexOf(':');
            const key = trimmed.substring(0, idx).trim();
            const val = trimmed.substring(idx + 1).trim();
            if (key && val) specsObj[key] = val;
        } else if (trimmed) {
            specsObj[`Thông số ${Object.keys(specsObj).length + 1}`] = trimmed;
        }
    });
    return specsObj;
}

// Secure API Fetch Wrapper
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

    const prodTable = document.getElementById('adminProductsTable');
    const orderTable = document.getElementById('adminOrdersTable');
    const customTable = document.getElementById('adminCustomTable');
    const usersTable = document.getElementById('adminUsersTable');
    const newsTable = document.getElementById('adminNewsTable');

    if (prodTable) prodTable.innerHTML = '';
    if (orderTable) orderTable.innerHTML = '';
    if (customTable) customTable.innerHTML = '';
    if (usersTable) usersTable.innerHTML = '';
    if (newsTable) newsTable.innerHTML = '';
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
        loadAdminUsers().catch(() => {}),
        loadAdminNews().catch(() => {}),
        loadAdminCustomRequests().catch(() => {})
    ]);
}

// Sidebar Navigation Tabs
function setupAdminNavigation() {
    const menuItems = document.querySelectorAll('.admin-menu-item[data-tab]');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const targetTab = item.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.style.display = 'none';
            });
            const section = document.getElementById(targetTab);
            if (section) section.style.display = 'block';
        });
    });
}

// Load Products Table
async function loadAdminProducts() {
    const tbody = document.getElementById('adminProductsTable');
    if (!tbody) return;

    try {
        const res = await fetchAdmin('/api/admin/products');
        adminProductsList = await res.json();

        document.getElementById('statProductCount').textContent = adminProductsList.length;
        filterAndRenderAdminProducts();

    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="5" style="color:var(--accent-red);">Lỗi tải sản phẩm từ D1</td></tr>';
    }
}

// Setup Admin Product Live Search & Filter Bar
function setupAdminProductSearch() {
    const searchInput = document.getElementById('adminProductSearchInput');
    const catSelect = document.getElementById('adminProductCategoryFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterAndRenderAdminProducts);
    }
    if (catSelect) {
        catSelect.addEventListener('change', filterAndRenderAdminProducts);
    }
}

// Filter and Render Admin Products
function filterAndRenderAdminProducts() {
    const keyword = (document.getElementById('adminProductSearchInput')?.value || '').toLowerCase().trim();
    const category = document.getElementById('adminProductCategoryFilter')?.value || 'all';

    const filtered = adminProductsList.filter(p => {
        const matchCat = category === 'all' || p.category_id === category;
        const matchKey = !keyword || 
            p.name.toLowerCase().includes(keyword) || 
            p.id.toLowerCase().includes(keyword) || 
            (p.description || '').toLowerCase().includes(keyword);
        return matchCat && matchKey;
    });

    const label = document.getElementById('adminSearchResultLabel');
    if (label) {
        label.textContent = `Hiển thị ${filtered.length} / ${adminProductsList.length} sản phẩm`;
    }

    const tbody = document.getElementById('adminProductsTable');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:25px;">Không tìm thấy sản phẩm nào phù hợp với từ khóa!</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td><img src="${p.image}" alt="${p.name}" style="width:45px; height:45px; object-fit:contain; border-radius:6px;"></td>
            <td style="font-weight:700;">${p.name}<br><small style="color:var(--text-muted); font-weight:400;">Mã ID: ${p.id}</small></td>
            <td><span style="background:#e0f2fe; color:#0056b3; padding:4px 10px; border-radius:12px; font-size:0.75rem; font-weight:700;">${p.category_id}</span></td>
            <td style="font-weight:800; color:var(--primary);">${new Intl.NumberFormat('vi-VN').format(p.price)} đ</td>
            <td>
                <button onclick="openEditProductModal('${p.id}')" style="background:#0284c7; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; margin-right:5px;" title="Chỉnh sửa sản phẩm"><i class="fa-solid fa-pen-to-square"></i> Sửa</button>
                <button onclick="deleteProduct('${p.id}')" style="background:#ef4444; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem;" title="Xoá sản phẩm"><i class="fa-solid fa-trash"></i> Xoá</button>
            </td>
        </tr>
    `).join('');
}

// Add Product Modal
function setupAddProductModal() {
    const modal = document.getElementById('addProductModal');
    const openBtn = document.getElementById('openAddProductBtn');
    const closeBtn = document.getElementById('closeAddProductBtn');
    const form = document.getElementById('addProductForm');

    openBtn?.addEventListener('click', () => modal?.classList.add('active'));
    closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const specsText = document.getElementById('prodSpecsLines').value;
        const newProd = {
            name: document.getElementById('prodName').value.trim(),
            category_id: document.getElementById('prodCategory').value,
            price: parseInt(document.getElementById('prodPrice').value) || 0,
            original_price: parseInt(document.getElementById('prodOriginalPrice').value) || 0,
            image: document.getElementById('prodImage').value.trim(),
            description: document.getElementById('prodDescription').value.trim(),
            specs: textToSpecsObj(specsText)
        };

        try {
            const res = await fetchAdmin('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProd)
            });

            const result = await res.json();
            if (result.success) {
                showAdminToast('Đã thêm sản phẩm thành công vào D1!', 'success');
                modal?.classList.remove('active');
                form.reset();
                loadAdminProducts();
            } else {
                throw new Error(result.error || 'Thêm thất bại');
            }
        } catch (err) {
            showAdminToast('Lỗi thêm sản phẩm: ' + err.message, 'error');
        }
    });
}

// Edit Product Modal
function setupEditProductModal() {
    const modal = document.getElementById('editProductModal');
    const closeBtn = document.getElementById('closeEditProductBtn');
    const form = document.getElementById('editProductForm');

    closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const prodId = document.getElementById('editProdId').value;
        const specsText = document.getElementById('editProdSpecsLines').value;

        const updatedProd = {
            name: document.getElementById('editProdName').value.trim(),
            category_id: document.getElementById('editProdCategory').value,
            price: parseInt(document.getElementById('editProdPrice').value) || 0,
            original_price: parseInt(document.getElementById('editProdOriginalPrice').value) || 0,
            image: document.getElementById('editProdImage').value.trim(),
            description: document.getElementById('editProdDescription').value.trim(),
            specs: textToSpecsObj(specsText)
        };

        try {
            const res = await fetchAdmin(`/api/admin/products/${prodId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProd)
            });

            const result = await res.json();
            if (result.success) {
                showAdminToast('Đã cập nhật sản phẩm thành công!', 'success');
                modal?.classList.remove('active');
                loadAdminProducts();
            } else {
                throw new Error(result.error || 'Cập nhật thất bại');
            }
        } catch (err) {
            showAdminToast('Lỗi cập nhật sản phẩm: ' + err.message, 'error');
        }
    });
}

function openEditProductModal(productId) {
    const product = adminProductsList.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('editProdId').value = product.id;
    document.getElementById('editProdName').value = product.name;
    document.getElementById('editProdCategory').value = product.category_id;
    document.getElementById('editProdPrice').value = product.price;
    document.getElementById('editProdOriginalPrice').value = product.original_price || '';
    document.getElementById('editProdImage').value = product.image;
    document.getElementById('editProdDescription').value = product.description || '';
    document.getElementById('editProdSpecsLines').value = specsToText(product.specs_json);

    document.getElementById('editProductModal')?.classList.add('active');
}

async function deleteProduct(id) {
    if (!confirm(`Bạn có chắc chắn muốn xoá sản phẩm mã "${id}" khỏi D1 database không?`)) return;

    try {
        const res = await fetchAdmin(`/api/admin/products/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            showAdminToast('Đã xoá sản phẩm khỏi database!', 'success');
            loadAdminProducts();
        } else {
            throw new Error(result.error || 'Xoá thất bại');
        }
    } catch (err) {
        showAdminToast('Lỗi xoá sản phẩm: ' + err.message, 'error');
    }
}

// Load Orders Table with Status Update Selector
async function loadAdminOrders() {
    const tbody = document.getElementById('adminOrdersTable');
    if (!tbody) return;

    try {
        const res = await fetchAdmin('/api/admin/orders');
        const orders = await res.json();

        document.getElementById('statOrderCount').textContent = orders.length;

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">Chưa có đơn hàng nào trong hệ thống.</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(o => {
            const st = o.status || 'CHO_XAC_NHAN';
            return `
                <tr>
                    <td style="font-weight:700; font-size:0.85rem;">${o.id}</td>
                    <td style="font-weight:700;">${o.customer_name}<br><small style="color:#64748b; font-weight:400;">User: ${o.customer_username || 'Khách Vô Danh'}</small></td>
                    <td>${o.customer_phone}</td>
                    <td style="max-width:200px; font-size:0.85rem;">${o.customer_address}</td>
                    <td style="font-weight:800; color:var(--primary);">${new Intl.NumberFormat('vi-VN').format(o.total_amount)} đ</td>
                    <td>
                        <select onchange="updateOrderStatus('${o.id}', this.value)" style="padding:6px 10px; border-radius:8px; font-weight:700; font-size:0.82rem; cursor:pointer; border:1px solid #cbd5e1; background:#ffffff;">
                            <option value="CHO_XAC_NHAN" ${st === 'CHO_XAC_NHAN' ? 'selected' : ''}>🟡 Chờ Xác Nhận</option>
                            <option value="DA_XAC_NHAN" ${st === 'DA_XAC_NHAN' ? 'selected' : ''}>🔵 Đã Xác Nhận Đơn</option>
                            <option value="DANG_GIAO_HANG" ${st === 'DANG_GIAO_HANG' ? 'selected' : ''}>🚚 Đang Giao & Thi Công</option>
                            <option value="DA_THANH_TOAN" ${st === 'DA_THANH_TOAN' ? 'selected' : ''}>🟢 Đã Thanh Toán & Lắp Đặt</option>
                            <option value="DA_HUY" ${st === 'DA_HUY' ? 'selected' : ''}>🔴 Đã Hủy Đơn</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" style="color:var(--accent-red);">Lỗi tải danh sách đơn hàng</td></tr>';
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const res = await fetchAdmin(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await res.json();
        if (result.success) {
            showAdminToast('Đã cập nhật trạng thái đơn hàng thành công!', 'success');
            loadAdminOrders();
        } else {
            throw new Error(result.error || 'Cập nhật thất bại');
        }
    } catch (err) {
        showAdminToast('Lỗi: ' + err.message, 'error');
    }
}

// Load Users Table (NEW)
async function loadAdminUsers() {
    const tbody = document.getElementById('adminUsersTable');
    if (!tbody) return;

    try {
        const res = await fetchAdmin('/api/admin/users');
        adminUsersList = await res.json();

        const countLabel = document.getElementById('statUserCount');
        if (countLabel) countLabel.textContent = adminUsersList.length;

        if (adminUsersList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:20px;">Chưa có tài khoản user nào registered.</td></tr>';
            return;
        }

        tbody.innerHTML = adminUsersList.map(u => `
            <tr>
                <td style="font-weight:700; font-size:0.8rem;">${u.id}</td>
                <td style="font-weight:800;">${u.full_name}</td>
                <td style="color:#0056b3; font-weight:700;">${u.username}</td>
                <td>${u.email}</td>
                <td>${u.phone}</td>
                <td><span style="background:#fef3c7; color:#b45309; padding:4px 8px; border-radius:10px; font-size:0.75rem; font-weight:700;">${u.role || 'user'}</span></td>
                <td>
                    <button onclick="deleteAdminUser('${u.id}')" style="background:#ef4444; color:#fff; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:0.78rem;"><i class="fa-solid fa-user-xmark"></i> Xoá User</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" style="color:var(--accent-red);">Lỗi tải danh sách User</td></tr>';
    }
}

async function deleteAdminUser(id) {
    if (!confirm('Bạn có chắc chắn muốn xoá tài khoản user này khỏi database?')) return;

    try {
        const res = await fetchAdmin(`/api/admin/users/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            showAdminToast('Đã xoá tài khoản user thành công!', 'success');
            loadAdminUsers();
        } else {
            throw new Error(result.error || 'Xoá user thất bại');
        }
    } catch (err) {
        showAdminToast('Lỗi: ' + err.message, 'error');
    }
}

// Load News Table (NEW)
async function loadAdminNews() {
    const tbody = document.getElementById('adminNewsTable');
    if (!tbody) return;

    try {
        const res = await fetchAdmin('/api/admin/news');
        adminNewsList = await res.json();

        if (adminNewsList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:20px;">Chưa có bài viết tin tức nào.</td></tr>';
            return;
        }

        tbody.innerHTML = adminNewsList.map(n => `
            <tr>
                <td><img src="${n.image}" alt="${n.title}" style="width:50px; height:35px; object-fit:cover; border-radius:4px;"></td>
                <td style="font-weight:700; max-width:260px;">
                    <a href="baiviet.html?id=${n.id}" target="_blank" style="color:#0f172a; text-decoration:none;" title="Xem trang độc lập">${n.title} <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem; color:#0056b3;"></i></a>
                </td>
                <td><span style="background:#e0f2fe; color:#0056b3; padding:4px 8px; border-radius:10px; font-size:0.75rem; font-weight:700;">${n.category || 'Tin Tức'}</span></td>
                <td>
                    ${n.youtube_url ? `<span style="color:#ef4444; font-weight:700; font-size:0.8rem;"><i class="fa-brands fa-youtube"></i> Có Video</span>` : `<span style="color:#94a3b8; font-size:0.8rem;">Không</span>`}
                </td>
                <td>
                    <button onclick="openEditNewsModal('${n.id}')" style="background:#0284c7; color:#fff; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:0.78rem; margin-right:4px;"><i class="fa-solid fa-pen-to-square"></i> Sửa</button>
                    <button onclick="deleteAdminNews('${n.id}')" style="background:#ef4444; color:#fff; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:0.78rem;"><i class="fa-solid fa-trash"></i> Xoá</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" style="color:var(--accent-red);">Lỗi tải danh sách tin tức</td></tr>';
    }
}

function setupAddNewsModal() {
    const modal = document.getElementById('addNewsModal');
    const openBtn = document.getElementById('openAddNewsBtn');
    const closeBtn = document.getElementById('closeAddNewsBtn');
    const form = document.getElementById('addNewsForm');

    openBtn?.addEventListener('click', () => modal?.classList.add('active'));
    closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newNews = {
            title: document.getElementById('newsTitle').value.trim(),
            category: document.getElementById('newsCategory').value,
            image: document.getElementById('newsImage').value.trim(),
            youtube_url: (document.getElementById('newsYoutubeUrl')?.value || '').trim(),
            summary: document.getElementById('newsSummary').value.trim(),
            content: document.getElementById('newsContent').value.trim()
        };

        try {
            const res = await fetchAdmin('/api/admin/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNews)
            });

            const result = await res.json();
            if (result.success) {
                showAdminToast('Đã đăng bài viết tin tức thành công!', 'success');
                modal?.classList.remove('active');
                form.reset();
                loadAdminNews();
            } else {
                throw new Error(result.error || 'Đăng thất bại');
            }
        } catch (err) {
            showAdminToast('Lỗi đăng tin tức: ' + err.message, 'error');
        }
    });
}

async function deleteAdminNews(id) {
    if (!confirm('Bạn có chắc chắn muốn xoá bài viết này không?')) return;

    try {
        const res = await fetchAdmin(`/api/admin/news/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            showAdminToast('Đã xoá bài viết tin tức!', 'success');
            loadAdminNews();
        } else {
            throw new Error(result.error || 'Xoá tin tức thất bại');
        }
    } catch (err) {
        showAdminToast('Lỗi xoá tin tức: ' + err.message, 'error');
    }
}


// Edit News Modal Handlers
function openEditNewsModal(newsId) {
    const article = adminNewsList.find(n => n.id === newsId);
    if (!article) return;

    document.getElementById('editNewsId').value = article.id;
    document.getElementById('editNewsTitle').value = article.title || '';
    document.getElementById('editNewsCategory').value = article.category || 'Tin Khuyến Mãi';
    document.getElementById('editNewsImage').value = article.image || '';
    document.getElementById('editNewsYoutubeUrl').value = article.youtube_url || '';
    document.getElementById('editNewsSummary').value = article.summary || '';
    document.getElementById('editNewsContent').value = article.content || '';

    document.getElementById('editNewsModal')?.classList.add('active');
}

function setupEditNewsModal() {
    const modal = document.getElementById('editNewsModal');
    const closeBtn = document.getElementById('closeEditNewsBtn');
    const form = document.getElementById('editNewsForm');

    closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editNewsId').value;
        const updatedData = {
            title: document.getElementById('editNewsTitle').value.trim(),
            category: document.getElementById('editNewsCategory').value,
            image: document.getElementById('editNewsImage').value.trim(),
            youtube_url: document.getElementById('editNewsYoutubeUrl').value.trim(),
            summary: document.getElementById('editNewsSummary').value.trim(),
            content: document.getElementById('editNewsContent').value.trim()
        };

        try {
            const res = await fetchAdmin(`/api/admin/news/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            const result = await res.json();
            if (result.success) {
                showAdminToast('Đã cập nhật bài viết tin tức thành công!', 'success');
                modal?.classList.remove('active');
                loadAdminNews();
            } else {
                throw new Error(result.error || 'Cập nhật tin tức thất bại');
            }
        } catch (err) {
            showAdminToast('Lỗi cập nhật tin tức: ' + err.message, 'error');
        }
    });
}

// Load Custom Installation Requests Table
async function loadAdminCustomRequests() {
    const tbody = document.getElementById('adminCustomTable');
    if (!tbody) return;

    try {
        const res = await fetchAdmin('/api/admin/custom-requests');
        const customRequests = await res.json();

        document.getElementById('statCustomCount').textContent = customRequests.length;

        if (customRequests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">Chưa có yêu cầu khảo sát nào.</td></tr>';
            return;
        }

        tbody.innerHTML = customRequests.map(c => `
            <tr>
                <td style="font-weight:700;">${c.id}</td>
                <td>${c.customer_name}</td>
                <td>${c.customer_phone}</td>
                <td>${c.target_item}</td>
                <td>${c.resolution || 'Bộ 4 Cam'} - ${c.battery_type || 'Full-Color'}</td>
                <td><span style="background:#fef3c7; color:#b45309; padding:4px 8px; border-radius:12px; font-size:0.8rem; font-weight:700;">CHỜ TƯ VẤN</span></td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" style="color:var(--accent-red);">Lỗi tải yêu cầu khảo sát</td></tr>';
    }
}

// Toast System
function showAdminToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'error') toast.style.borderLeftColor = 'var(--accent-red)';
    if (type === 'success') toast.style.borderLeftColor = 'var(--accent-green)';

    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

function quickFillAdmin() {
    const userEl = document.getElementById('adminUser');
    const passEl = document.getElementById('adminPass');
    if (userEl) userEl.value = 'admin';
    if (passEl) passEl.value = '123';
}
