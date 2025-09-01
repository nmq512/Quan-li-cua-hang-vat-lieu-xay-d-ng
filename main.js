// Main JavaScript for Construction Materials Store Management System

// Global variables
let currentSection = 'dashboard';
let currentProductPage = 1;
let productsPerPage = 10;
let allProducts = [];
let filteredProducts = [];
let currentCustomerPage = 1;
let customersPerPage = 10;
let allCustomers = [];
let filteredCustomers = [];
let currentOrderPage = 1;
let ordersPerPage = 10;
let allOrders = [];
let filteredOrders = [];
let orderItems = [];
let orderItemCounter = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadDashboardData();
    loadProductsData();
    loadCustomersData();
    loadOrdersData();
    setupEventListeners();
});

// Initialize application
function initializeApp() {
    // Setup sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    });

    overlay.addEventListener('click', function() {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    });

    // Set initial active nav
    setActiveNav('dashboard');
}

// Setup event listeners
function setupEventListeners() {
    // Product search and filters
    document.getElementById('product-search').addEventListener('input', filterProducts);
    document.getElementById('category-filter').addEventListener('change', filterProducts);
    document.getElementById('status-filter').addEventListener('change', filterProducts);

    // Product form submission
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);

    // Product pagination
    document.getElementById('products-prev-btn').addEventListener('click', () => changePage(-1));
    document.getElementById('products-next-btn').addEventListener('click', () => changePage(1));
    
    // Customer search and filters
    document.getElementById('customer-search').addEventListener('input', filterCustomers);
    document.getElementById('customer-type-filter').addEventListener('change', filterCustomers);

    // Customer form submission
    document.getElementById('customer-form').addEventListener('submit', handleCustomerSubmit);

    // Customer pagination
    document.getElementById('customers-prev-btn').addEventListener('click', () => changeCustomerPage(-1));
    document.getElementById('customers-next-btn').addEventListener('click', () => changeCustomerPage(1));
    
    // Order search and filters
    document.getElementById('order-search').addEventListener('input', filterOrders);
    document.getElementById('order-status-filter').addEventListener('change', filterOrders);
    document.getElementById('payment-status-filter').addEventListener('change', filterOrders);

    // Order form submission
    document.getElementById('order-form').addEventListener('submit', handleOrderSubmit);

    // Order pagination
    document.getElementById('orders-prev-btn').addEventListener('click', () => changeOrderPage(-1));
    document.getElementById('orders-next-btn').addEventListener('click', () => changeOrderPage(1));
    
    // Order calculation listeners
    document.getElementById('order-discount').addEventListener('input', calculateOrderTotal);
}

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        currentSection = sectionName;
        setActiveNav(sectionName);

        // Load section-specific data
        switch (sectionName) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'products':
                loadProductsData();
                break;
            case 'customers':
                loadCustomersData();
                break;
            case 'orders':
                loadOrdersData();
                break;
            // Add other cases as needed
        }
    }
}

function setActiveNav(sectionName) {
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('bg-blue-50', 'text-blue-600');
        link.classList.add('text-gray-700');
    });

    // Add active class to current nav link
    const activeLink = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeLink) {
        activeLink.classList.add('bg-blue-50', 'text-blue-600');
        activeLink.classList.remove('text-gray-700');
    }
}

// Dashboard functions
async function loadDashboardData() {
    try {
        // Load statistics
        await Promise.all([
            loadTotalProducts(),
            loadTodayOrders(),
            loadTodayRevenue(),
            loadLowStockCount(),
            loadRecentOrders(),
            loadLowStockAlerts()
        ]);

        // Load charts
        loadRevenueChart();
        loadCategoryChart();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadTotalProducts() {
    try {
        const response = await fetch('tables/products?limit=1');
        const data = await response.json();
        document.getElementById('total-products').textContent = data.total || 0;
    } catch (error) {
        console.error('Error loading total products:', error);
        document.getElementById('total-products').textContent = '0';
    }
}

async function loadTodayOrders() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`tables/orders?limit=1000`);
        const data = await response.json();
        
        const todayOrders = data.data.filter(order => {
            const orderDate = new Date(order.order_date).toISOString().split('T')[0];
            return orderDate === today;
        });
        
        document.getElementById('today-orders').textContent = todayOrders.length;
    } catch (error) {
        console.error('Error loading today orders:', error);
        document.getElementById('today-orders').textContent = '0';
    }
}

async function loadTodayRevenue() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`tables/orders?limit=1000`);
        const data = await response.json();
        
        const todayRevenue = data.data
            .filter(order => {
                const orderDate = new Date(order.order_date).toISOString().split('T')[0];
                return orderDate === today && order.payment_status === 'Đã thanh toán';
            })
            .reduce((sum, order) => sum + (order.final_amount || 0), 0);
        
        document.getElementById('today-revenue').textContent = formatCurrency(todayRevenue);
    } catch (error) {
        console.error('Error loading today revenue:', error);
        document.getElementById('today-revenue').textContent = '0₫';
    }
}

async function loadLowStockCount() {
    try {
        const response = await fetch('tables/products?limit=1000');
        const data = await response.json();
        
        const lowStockProducts = data.data.filter(product => 
            product.stock_quantity <= (product.min_stock || 10)
        );
        
        document.getElementById('low-stock-count').textContent = lowStockProducts.length;
    } catch (error) {
        console.error('Error loading low stock count:', error);
        document.getElementById('low-stock-count').textContent = '0';
    }
}

async function loadRecentOrders() {
    try {
        const response = await fetch('tables/orders?limit=5&sort=created_at');
        const data = await response.json();
        
        const recentOrdersContainer = document.getElementById('recent-orders');
        
        if (data.data.length === 0) {
            recentOrdersContainer.innerHTML = '<p class="text-gray-500 text-sm">Chưa có đơn hàng nào</p>';
            return;
        }
        
        const ordersHTML = data.data.map(order => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex-1">
                    <p class="font-medium text-gray-900">${order.customer_name || 'Khách hàng'}</p>
                    <p class="text-sm text-gray-600">Đơn hàng #${order.order_number || order.id.slice(-6)}</p>
                </div>
                <div class="text-right">
                    <p class="font-medium text-gray-900">${formatCurrency(order.final_amount || 0)}</p>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}">
                        ${order.status || 'Chờ xử lý'}
                    </span>
                </div>
            </div>
        `).join('');
        
        recentOrdersContainer.innerHTML = ordersHTML;
    } catch (error) {
        console.error('Error loading recent orders:', error);
        document.getElementById('recent-orders').innerHTML = '<p class="text-red-500 text-sm">Không thể tải đơn hàng</p>';
    }
}

async function loadLowStockAlerts() {
    try {
        const response = await fetch('tables/products?limit=1000');
        const data = await response.json();
        
        const lowStockProducts = data.data.filter(product => 
            product.stock_quantity <= (product.min_stock || 10)
        ).slice(0, 5);
        
        const alertsContainer = document.getElementById('low-stock-alerts');
        
        if (lowStockProducts.length === 0) {
            alertsContainer.innerHTML = '<p class="text-green-500 text-sm">Tất cả sản phẩm đều đủ hàng</p>';
            return;
        }
        
        const alertsHTML = lowStockProducts.map(product => `
            <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div class="flex-1">
                    <p class="font-medium text-gray-900">${product.name}</p>
                    <p class="text-sm text-gray-600">${product.category}</p>
                </div>
                <div class="text-right">
                    <p class="font-medium text-red-600">${product.stock_quantity} ${product.unit}</p>
                    <p class="text-xs text-gray-500">Tối thiểu: ${product.min_stock || 10}</p>
                </div>
            </div>
        `).join('');
        
        alertsContainer.innerHTML = alertsHTML;
    } catch (error) {
        console.error('Error loading low stock alerts:', error);
        document.getElementById('low-stock-alerts').innerHTML = '<p class="text-red-500 text-sm">Không thể tải cảnh báo</p>';
    }
}

function loadRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    // Generate sample data for the last 7 days
    const last7Days = [];
    const revenueData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }));
        revenueData.push(Math.floor(Math.random() * 50000000) + 10000000); // Random revenue data
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: revenueData,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

async function loadCategoryChart() {
    try {
        const response = await fetch('tables/products?limit=1000');
        const data = await response.json();
        
        const categoryCounts = {};
        data.data.forEach(product => {
            const category = product.category || 'Khác';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryCounts),
                datasets: [{
                    data: Object.values(categoryCounts),
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
                        '#8B5CF6', '#F97316', '#06B6D4', '#84CC16',
                        '#EC4899', '#6B7280'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading category chart:', error);
    }
}

// Product management functions
async function loadProductsData(page = 1) {
    try {
        const response = await fetch(`tables/products?page=${page}&limit=${productsPerPage}&sort=created_at`);
        const data = await response.json();
        
        allProducts = data.data;
        filteredProducts = [...allProducts];
        currentProductPage = data.page;
        
        displayProducts(filteredProducts);
        updateProductsPagination(data.total, data.page, data.limit);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Không thể tải danh sách sản phẩm', 'error');
    }
}

function displayProducts(products) {
    const tbody = document.getElementById('products-table-body');
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    <i class="fas fa-box-open text-4xl mb-2"></i>
                    <p>Không có sản phẩm nào</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const productsHTML = products.map(product => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div>
                    <div class="text-sm font-medium text-gray-900">${product.name}</div>
                    <div class="text-sm text-gray-500">${product.description || ''}</div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${product.category}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${formatCurrency(product.price)}/${product.unit}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${product.stock_quantity} ${product.unit}</div>
                ${product.stock_quantity <= (product.min_stock || 10) ? 
                    '<div class="text-xs text-red-600">⚠️ Sắp hết hàng</div>' : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProductStatusColor(product.status)}">
                    ${product.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onclick="editProduct('${product.id}')" class="text-indigo-600 hover:text-indigo-900">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteProduct('${product.id}')" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = productsHTML;
}

function filterProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                             (product.description && product.description.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesStatus = !statusFilter || product.status === statusFilter;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    displayProducts(filteredProducts);
    updateProductsPagination(filteredProducts.length, 1, productsPerPage);
}

function updateProductsPagination(total, currentPage, limit) {
    const totalPages = Math.ceil(total / limit);
    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, total);
    
    document.getElementById('products-showing-start').textContent = total > 0 ? startItem : 0;
    document.getElementById('products-showing-end').textContent = endItem;
    document.getElementById('products-total').textContent = total;
    
    // Update pagination buttons
    const prevBtn = document.getElementById('products-prev-btn');
    const nextBtn = document.getElementById('products-next-btn');
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    
    prevBtn.classList.toggle('opacity-50', currentPage <= 1);
    nextBtn.classList.toggle('opacity-50', currentPage >= totalPages);
}

function changePage(direction) {
    const newPage = currentProductPage + direction;
    if (newPage >= 1) {
        loadProductsData(newPage);
    }
}

// Product modal functions
function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    const submitText = document.getElementById('product-submit-text');
    
    if (productId) {
        title.textContent = 'Chỉnh sửa sản phẩm';
        submitText.textContent = 'Cập nhật sản phẩm';
        loadProductForEdit(productId);
    } else {
        title.textContent = 'Thêm sản phẩm mới';
        submitText.textContent = 'Lưu sản phẩm';
        resetProductForm();
    }
    
    modal.classList.remove('hidden');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
    resetProductForm();
}

function resetProductForm() {
    const form = document.getElementById('product-form');
    form.reset();
    document.getElementById('product-id').value = '';
}

async function loadProductForEdit(productId) {
    try {
        const response = await fetch(`tables/products/${productId}`);
        const product = await response.json();
        
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-unit').value = product.unit;
        document.getElementById('product-cost-price').value = product.cost_price;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock-quantity').value = product.stock_quantity;
        document.getElementById('product-min-stock').value = product.min_stock || '';
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-status').value = product.status;
    } catch (error) {
        console.error('Error loading product for edit:', error);
        showNotification('Không thể tải thông tin sản phẩm', 'error');
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        unit: document.getElementById('product-unit').value,
        cost_price: parseFloat(document.getElementById('product-cost-price').value),
        price: parseFloat(document.getElementById('product-price').value),
        stock_quantity: parseInt(document.getElementById('product-stock-quantity').value),
        min_stock: parseInt(document.getElementById('product-min-stock').value) || 10,
        description: document.getElementById('product-description').value,
        status: document.getElementById('product-status').value,
        supplier_id: '' // Will be set when supplier management is implemented
    };
    
    try {
        let response;
        if (productId) {
            // Update existing product
            response = await fetch(`tables/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        } else {
            // Create new product
            response = await fetch('tables/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
        }
        
        if (response.ok) {
            closeProductModal();
            loadProductsData(currentProductPage);
            loadDashboardData(); // Refresh dashboard stats
            showNotification(
                productId ? 'Sản phẩm đã được cập nhật!' : 'Sản phẩm đã được thêm!',
                'success'
            );
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showNotification('Không thể lưu sản phẩm', 'error');
    }
}

function editProduct(productId) {
    openProductModal(productId);
}

async function deleteProduct(productId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        return;
    }
    
    try {
        const response = await fetch(`tables/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadProductsData(currentProductPage);
            loadDashboardData(); // Refresh dashboard stats
            showNotification('Sản phẩm đã được xóa!', 'success');
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Không thể xóa sản phẩm', 'error');
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function getStatusColor(status) {
    const colors = {
        'Chờ xử lý': 'bg-yellow-100 text-yellow-800',
        'Đang chuẩn bị': 'bg-blue-100 text-blue-800',
        'Đang giao': 'bg-purple-100 text-purple-800',
        'Đã giao': 'bg-green-100 text-green-800',
        'Đã hủy': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

function getProductStatusColor(status) {
    const colors = {
        'Đang bán': 'bg-green-100 text-green-800',
        'Ngưng bán': 'bg-yellow-100 text-yellow-800',
        'Hết hàng': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

// Customer management functions
async function loadCustomersData(page = 1) {
    try {
        const response = await fetch(`tables/customers?page=${page}&limit=${customersPerPage}&sort=created_at`);
        const data = await response.json();
        
        allCustomers = data.data;
        filteredCustomers = [...allCustomers];
        currentCustomerPage = data.page;
        
        displayCustomers(filteredCustomers);
        updateCustomersPagination(data.total, data.page, data.limit);
    } catch (error) {
        console.error('Error loading customers:', error);
        showNotification('Không thể tải danh sách khách hàng', 'error');
    }
}

function displayCustomers(customers) {
    const tbody = document.getElementById('customers-table-body');
    
    if (customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    <i class="fas fa-users text-4xl mb-2"></i>
                    <p>Không có khách hàng nào</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const customersHTML = customers.map(customer => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div>
                    <div class="text-sm font-medium text-gray-900">${customer.name}</div>
                    <div class="text-sm text-gray-500">${customer.address || ''}</div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCustomerTypeColor(customer.customer_type)}">
                    ${customer.customer_type}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>${customer.phone}</div>
                ${customer.email ? `<div class="text-gray-500">${customer.email}</div>` : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${formatCurrency(customer.total_spent || 0)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${customer.loyalty_points || 0} điểm</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onclick="editCustomer('${customer.id}')" class="text-indigo-600 hover:text-indigo-900">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteCustomer('${customer.id}')" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = customersHTML;
}

function filterCustomers() {
    const searchTerm = document.getElementById('customer-search').value.toLowerCase();
    const typeFilter = document.getElementById('customer-type-filter').value;
    
    filteredCustomers = allCustomers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm) ||
                             (customer.phone && customer.phone.includes(searchTerm)) ||
                             (customer.email && customer.email.toLowerCase().includes(searchTerm));
        const matchesType = !typeFilter || customer.customer_type === typeFilter;
        
        return matchesSearch && matchesType;
    });
    
    displayCustomers(filteredCustomers);
    updateCustomersPagination(filteredCustomers.length, 1, customersPerPage);
}

function updateCustomersPagination(total, currentPage, limit) {
    const totalPages = Math.ceil(total / limit);
    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, total);
    
    document.getElementById('customers-showing-start').textContent = total > 0 ? startItem : 0;
    document.getElementById('customers-showing-end').textContent = endItem;
    document.getElementById('customers-total').textContent = total;
    
    // Update pagination buttons
    const prevBtn = document.getElementById('customers-prev-btn');
    const nextBtn = document.getElementById('customers-next-btn');
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    
    prevBtn.classList.toggle('opacity-50', currentPage <= 1);
    nextBtn.classList.toggle('opacity-50', currentPage >= totalPages);
}

function changeCustomerPage(direction) {
    const newPage = currentCustomerPage + direction;
    if (newPage >= 1) {
        loadCustomersData(newPage);
    }
}

// Customer modal functions
function openCustomerModal(customerId = null) {
    const modal = document.getElementById('customer-modal');
    const title = document.getElementById('customer-modal-title');
    const submitText = document.getElementById('customer-submit-text');
    
    if (customerId) {
        title.textContent = 'Chỉnh sửa khách hàng';
        submitText.textContent = 'Cập nhật khách hàng';
        loadCustomerForEdit(customerId);
    } else {
        title.textContent = 'Thêm khách hàng mới';
        submitText.textContent = 'Lưu khách hàng';
        resetCustomerForm();
    }
    
    modal.classList.remove('hidden');
}

function closeCustomerModal() {
    const modal = document.getElementById('customer-modal');
    modal.classList.add('hidden');
    resetCustomerForm();
}

function resetCustomerForm() {
    const form = document.getElementById('customer-form');
    form.reset();
    document.getElementById('customer-id').value = '';
}

async function loadCustomerForEdit(customerId) {
    try {
        const response = await fetch(`tables/customers/${customerId}`);
        const customer = await response.json();
        
        document.getElementById('customer-id').value = customer.id;
        document.getElementById('customer-name').value = customer.name;
        document.getElementById('customer-type').value = customer.customer_type;
        document.getElementById('customer-phone').value = customer.phone;
        document.getElementById('customer-email').value = customer.email || '';
        document.getElementById('customer-address').value = customer.address || '';
        document.getElementById('customer-tax-code').value = customer.tax_code || '';
        document.getElementById('customer-credit-limit').value = customer.credit_limit || '';
        document.getElementById('customer-notes').value = customer.notes || '';
    } catch (error) {
        console.error('Error loading customer for edit:', error);
        showNotification('Không thể tải thông tin khách hàng', 'error');
    }
}

async function handleCustomerSubmit(e) {
    e.preventDefault();
    
    const customerId = document.getElementById('customer-id').value;
    const customerData = {
        name: document.getElementById('customer-name').value,
        customer_type: document.getElementById('customer-type').value,
        phone: document.getElementById('customer-phone').value,
        email: document.getElementById('customer-email').value,
        address: document.getElementById('customer-address').value,
        tax_code: document.getElementById('customer-tax-code').value,
        credit_limit: parseFloat(document.getElementById('customer-credit-limit').value) || 0,
        total_spent: 0,
        loyalty_points: 0,
        notes: document.getElementById('customer-notes').value
    };
    
    try {
        let response;
        if (customerId) {
            // Update existing customer
            response = await fetch(`tables/customers/${customerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
            });
        } else {
            // Create new customer
            response = await fetch('tables/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
            });
        }
        
        if (response.ok) {
            closeCustomerModal();
            loadCustomersData(currentCustomerPage);
            loadDashboardData(); // Refresh dashboard stats
            showNotification(
                customerId ? 'Khách hàng đã được cập nhật!' : 'Khách hàng đã được thêm!',
                'success'
            );
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Error saving customer:', error);
        showNotification('Không thể lưu khách hàng', 'error');
    }
}

function editCustomer(customerId) {
    openCustomerModal(customerId);
}

async function deleteCustomer(customerId) {
    if (!confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
        return;
    }
    
    try {
        const response = await fetch(`tables/customers/${customerId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadCustomersData(currentCustomerPage);
            loadDashboardData(); // Refresh dashboard stats
            showNotification('Khách hàng đã được xóa!', 'success');
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
        showNotification('Không thể xóa khách hàng', 'error');
    }
}

function getCustomerTypeColor(type) {
    const colors = {
        'Cá nhân': 'bg-blue-100 text-blue-800',
        'Công ty': 'bg-green-100 text-green-800',
        'Nhà thầu': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
}

// Order management functions
async function loadOrdersData(page = 1) {
    try {
        const response = await fetch(`tables/orders?page=${page}&limit=${ordersPerPage}&sort=created_at`);
        const data = await response.json();
        
        allOrders = data.data;
        filteredOrders = [...allOrders];
        currentOrderPage = data.page;
        
        displayOrders(filteredOrders);
        updateOrdersPagination(data.total, data.page, data.limit);
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Không thể tải danh sách đơn hàng', 'error');
    }
}

function displayOrders(orders) {
    const tbody = document.getElementById('orders-table-body');
    
    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    <i class="fas fa-shopping-cart text-4xl mb-2"></i>
                    <p>Không có đơn hàng nào</p>
                </td>
            </tr>
        `;
        return;
    }
    
    const ordersHTML = orders.map(order => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div>
                    <div class="text-sm font-medium text-gray-900">#${order.order_number || order.id.slice(-6)}</div>
                    <div class="text-sm text-gray-500">${formatDate(order.order_date)}</div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${order.customer_name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${formatDate(order.order_date)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${formatCurrency(order.final_amount || 0)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}">
                    ${order.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}">
                    ${order.payment_status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onclick="viewOrder('${order.id}')" class="text-blue-600 hover:text-blue-900">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="editOrder('${order.id}')" class="text-indigo-600 hover:text-indigo-900">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteOrder('${order.id}')" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = ordersHTML;
}

function filterOrders() {
    const searchTerm = document.getElementById('order-search').value.toLowerCase();
    const statusFilter = document.getElementById('order-status-filter').value;
    const paymentFilter = document.getElementById('payment-status-filter').value;
    
    filteredOrders = allOrders.filter(order => {
        const matchesSearch = (order.order_number && order.order_number.toLowerCase().includes(searchTerm)) ||
                             (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm)) ||
                             order.id.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || order.status === statusFilter;
        const matchesPayment = !paymentFilter || order.payment_status === paymentFilter;
        
        return matchesSearch && matchesStatus && matchesPayment;
    });
    
    displayOrders(filteredOrders);
    updateOrdersPagination(filteredOrders.length, 1, ordersPerPage);
}

function updateOrdersPagination(total, currentPage, limit) {
    const totalPages = Math.ceil(total / limit);
    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, total);
    
    document.getElementById('orders-showing-start').textContent = total > 0 ? startItem : 0;
    document.getElementById('orders-showing-end').textContent = endItem;
    document.getElementById('orders-total').textContent = total;
    
    // Update pagination buttons
    const prevBtn = document.getElementById('orders-prev-btn');
    const nextBtn = document.getElementById('orders-next-btn');
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    
    prevBtn.classList.toggle('opacity-50', currentPage <= 1);
    nextBtn.classList.toggle('opacity-50', currentPage >= totalPages);
}

function changeOrderPage(direction) {
    const newPage = currentOrderPage + direction;
    if (newPage >= 1) {
        loadOrdersData(newPage);
    }
}

// Order modal functions
async function openOrderModal(orderId = null) {
    const modal = document.getElementById('order-modal');
    const title = document.getElementById('order-modal-title');
    const submitText = document.getElementById('order-submit-text');
    
    // Load customers for dropdown
    await loadCustomersForOrder();
    
    if (orderId) {
        title.textContent = 'Chỉnh sửa đơn hàng';
        submitText.textContent = 'Cập nhật đơn hàng';
        loadOrderForEdit(orderId);
    } else {
        title.textContent = 'Tạo đơn hàng mới';
        submitText.textContent = 'Lưu đơn hàng';
        resetOrderForm();
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('order-date').value = today;
    }
    
    modal.classList.remove('hidden');
}

function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    modal.classList.add('hidden');
    resetOrderForm();
}

function resetOrderForm() {
    const form = document.getElementById('order-form');
    form.reset();
    document.getElementById('order-id').value = '';
    orderItems = [];
    orderItemCounter = 0;
    updateOrderItemsTable();
    calculateOrderTotal();
}

async function loadCustomersForOrder() {
    try {
        const response = await fetch('tables/customers?limit=1000');
        const data = await response.json();
        
        const select = document.getElementById('order-customer');
        select.innerHTML = '<option value="">Chọn khách hàng</option>';
        
        data.data.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.name} - ${customer.phone}`;
            option.dataset.address = customer.address || '';
            select.appendChild(option);
        });
        
        // Auto-fill delivery address when customer is selected
        select.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const deliveryAddress = document.getElementById('order-delivery-address');
            if (selectedOption.dataset.address) {
                deliveryAddress.value = selectedOption.dataset.address;
            }
        });
    } catch (error) {
        console.error('Error loading customers for order:', error);
    }
}

function addOrderItem() {
    orderItemCounter++;
    const newItem = {
        id: orderItemCounter,
        product_id: '',
        product_name: '',
        unit_price: 0,
        quantity: 1,
        unit: '',
        total_price: 0,
        discount_percent: 0,
        discount_amount: 0
    };
    
    orderItems.push(newItem);
    updateOrderItemsTable();
}

function removeOrderItem(itemId) {
    orderItems = orderItems.filter(item => item.id !== itemId);
    updateOrderItemsTable();
    calculateOrderTotal();
}

async function updateOrderItemsTable() {
    const tbody = document.getElementById('order-items-table');
    
    if (orderItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Chưa có sản phẩm nào</td></tr>';
        return;
    }
    
    // Load products for dropdowns
    let products = [];
    try {
        const response = await fetch('tables/products?limit=1000');
        const data = await response.json();
        products = data.data.filter(p => p.status === 'Đang bán');
    } catch (error) {
        console.error('Error loading products:', error);
    }
    
    const itemsHTML = orderItems.map(item => `
        <tr>
            <td class="px-4 py-2">
                <select onchange="updateOrderItemProduct(${item.id}, this.value)" class="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                    <option value="">Chọn sản phẩm</option>
                    ${products.map(product => `
                        <option value="${product.id}" ${item.product_id === product.id ? 'selected' : ''}>
                            ${product.name}
                        </option>
                    `).join('')}
                </select>
            </td>
            <td class="px-4 py-2">
                <input type="number" value="${item.unit_price}" onchange="updateOrderItemPrice(${item.id}, this.value)" 
                       class="w-full px-2 py-1 border border-gray-300 rounded text-sm" min="0">
            </td>
            <td class="px-4 py-2">
                <input type="number" value="${item.quantity}" onchange="updateOrderItemQuantity(${item.id}, this.value)" 
                       class="w-full px-2 py-1 border border-gray-300 rounded text-sm" min="1">
            </td>
            <td class="px-4 py-2 text-sm">
                ${formatCurrency(item.total_price)}
            </td>
            <td class="px-4 py-2">
                <button type="button" onclick="removeOrderItem(${item.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = itemsHTML;
}

async function updateOrderItemProduct(itemId, productId) {
    if (!productId) return;
    
    try {
        const response = await fetch(`tables/products/${productId}`);
        const product = await response.json();
        
        const item = orderItems.find(item => item.id === itemId);
        if (item) {
            item.product_id = product.id;
            item.product_name = product.name;
            item.unit_price = product.price;
            item.unit = product.unit;
            item.total_price = item.unit_price * item.quantity;
            
            updateOrderItemsTable();
            calculateOrderTotal();
        }
    } catch (error) {
        console.error('Error loading product:', error);
    }
}

function updateOrderItemPrice(itemId, price) {
    const item = orderItems.find(item => item.id === itemId);
    if (item) {
        item.unit_price = parseFloat(price) || 0;
        item.total_price = item.unit_price * item.quantity;
        updateOrderItemsTable();
        calculateOrderTotal();
    }
}

function updateOrderItemQuantity(itemId, quantity) {
    const item = orderItems.find(item => item.id === itemId);
    if (item) {
        item.quantity = parseInt(quantity) || 1;
        item.total_price = item.unit_price * item.quantity;
        updateOrderItemsTable();
        calculateOrderTotal();
    }
}

function calculateOrderTotal() {
    const totalAmount = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    const discount = parseFloat(document.getElementById('order-discount').value) || 0;
    const finalAmount = totalAmount - discount;
    
    document.getElementById('order-total-amount').value = totalAmount;
    document.getElementById('order-final-amount').value = Math.max(0, finalAmount);
}

async function handleOrderSubmit(e) {
    e.preventDefault();
    
    if (orderItems.length === 0) {
        showNotification('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng', 'warning');
        return;
    }
    
    const orderId = document.getElementById('order-id').value;
    const customerId = document.getElementById('order-customer').value;
    
    // Get customer name
    const customerSelect = document.getElementById('order-customer');
    const customerName = customerSelect.options[customerSelect.selectedIndex].text.split(' - ')[0];
    
    const orderData = {
        customer_id: customerId,
        customer_name: customerName,
        order_number: generateOrderNumber(),
        order_date: document.getElementById('order-date').value,
        delivery_date: document.getElementById('order-delivery-date').value,
        status: document.getElementById('order-status').value,
        payment_method: document.getElementById('order-payment-method').value,
        payment_status: document.getElementById('order-payment-method').value === 'Công nợ' ? 'Chưa thanh toán' : 'Đã thanh toán',
        delivery_address: document.getElementById('order-delivery-address').value,
        total_amount: parseFloat(document.getElementById('order-total-amount').value),
        discount: parseFloat(document.getElementById('order-discount').value) || 0,
        tax_amount: 0,
        final_amount: parseFloat(document.getElementById('order-final-amount').value),
        notes: document.getElementById('order-notes').value
    };
    
    try {
        let response;
        if (orderId) {
            // Update existing order
            response = await fetch(`tables/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
        } else {
            // Create new order
            response = await fetch('tables/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
        }
        
        if (response.ok) {
            const savedOrder = await response.json();
            
            // Save order items
            await saveOrderItems(savedOrder.id);
            
            closeOrderModal();
            loadOrdersData(currentOrderPage);
            loadDashboardData(); // Refresh dashboard stats
            showNotification(
                orderId ? 'Đơn hàng đã được cập nhật!' : 'Đơn hàng đã được tạo!',
                'success'
            );
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Error saving order:', error);
        showNotification('Không thể lưu đơn hàng', 'error');
    }
}

async function saveOrderItems(orderId) {
    // Clear existing order items
    try {
        const existingItems = await fetch(`tables/order_items?limit=1000`);
        const data = await existingItems.json();
        const itemsToDelete = data.data.filter(item => item.order_id === orderId);
        
        for (const item of itemsToDelete) {
            await fetch(`tables/order_items/${item.id}`, { method: 'DELETE' });
        }
    } catch (error) {
        console.error('Error clearing existing order items:', error);
    }
    
    // Save new order items
    for (const item of orderItems) {
        if (item.product_id) {
            const itemData = {
                order_id: orderId,
                product_id: item.product_id,
                product_name: item.product_name,
                unit_price: item.unit_price,
                quantity: item.quantity,
                unit: item.unit,
                total_price: item.total_price,
                discount_percent: item.discount_percent,
                discount_amount: item.discount_amount
            };
            
            try {
                await fetch('tables/order_items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(itemData)
                });
            } catch (error) {
                console.error('Error saving order item:', error);
            }
        }
    }
}

function generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.getTime().toString().slice(-4);
    
    return `DH${year}${month}${day}${time}`;
}

function viewOrder(orderId) {
    // This could open a detailed view modal - for now just edit
    editOrder(orderId);
}

function editOrder(orderId) {
    openOrderModal(orderId);
}

async function loadOrderForEdit(orderId) {
    try {
        const response = await fetch(`tables/orders/${orderId}`);
        const order = await response.json();
        
        document.getElementById('order-id').value = order.id;
        document.getElementById('order-customer').value = order.customer_id;
        document.getElementById('order-date').value = order.order_date?.split('T')[0] || '';
        document.getElementById('order-delivery-date').value = order.delivery_date?.split('T')[0] || '';
        document.getElementById('order-status').value = order.status;
        document.getElementById('order-payment-method').value = order.payment_method;
        document.getElementById('order-delivery-address').value = order.delivery_address || '';
        document.getElementById('order-discount').value = order.discount || 0;
        document.getElementById('order-notes').value = order.notes || '';
        
        // Load order items
        await loadOrderItems(orderId);
        
    } catch (error) {
        console.error('Error loading order for edit:', error);
        showNotification('Không thể tải thông tin đơn hàng', 'error');
    }
}

async function loadOrderItems(orderId) {
    try {
        const response = await fetch(`tables/order_items?limit=1000`);
        const data = await response.json();
        
        orderItems = data.data
            .filter(item => item.order_id === orderId)
            .map((item, index) => ({
                id: index + 1,
                product_id: item.product_id,
                product_name: item.product_name,
                unit_price: item.unit_price,
                quantity: item.quantity,
                unit: item.unit,
                total_price: item.total_price,
                discount_percent: item.discount_percent || 0,
                discount_amount: item.discount_amount || 0
            }));
        
        orderItemCounter = orderItems.length;
        updateOrderItemsTable();
        calculateOrderTotal();
        
    } catch (error) {
        console.error('Error loading order items:', error);
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
        return;
    }
    
    try {
        // Delete order items first
        const itemsResponse = await fetch(`tables/order_items?limit=1000`);
        const itemsData = await itemsResponse.json();
        const itemsToDelete = itemsData.data.filter(item => item.order_id === orderId);
        
        for (const item of itemsToDelete) {
            await fetch(`tables/order_items/${item.id}`, { method: 'DELETE' });
        }
        
        // Delete the order
        const response = await fetch(`tables/orders/${orderId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadOrdersData(currentOrderPage);
            loadDashboardData(); // Refresh dashboard stats
            showNotification('Đơn hàng đã được xóa!', 'success');
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        showNotification('Không thể xóa đơn hàng', 'error');
    }
}

function getPaymentStatusColor(status) {
    const colors = {
        'Chưa thanh toán': 'bg-red-100 text-red-800',
        'Đã thanh toán một phần': 'bg-yellow-100 text-yellow-800',
        'Đã thanh toán': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    // Set notification style based on type
    switch (type) {
        case 'success':
            notification.className += ' bg-green-500 text-white';
            break;
        case 'error':
            notification.className += ' bg-red-500 text-white';
            break;
        case 'warning':
            notification.className += ' bg-yellow-500 text-white';
            break;
        default:
            notification.className += ' bg-blue-500 text-white';
    }
    
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}