let salesChart, profitChart;

document.addEventListener('DOMContentLoaded', () => {
    // Initial loads (default limit 100)
    loadCustomers();
    loadProducts();
    loadOrders();
    loadSalesReport();

    // Search buttons (limit = 100)
    document.getElementById('searchCustomerBtn').addEventListener('click', () => loadCustomers(document.getElementById('customerSearch').value, false));
    document.getElementById('searchProductBtn').addEventListener('click', () => loadProducts(document.getElementById('productSearch').value, false));
    document.getElementById('searchOrderBtn').addEventListener('click', () => loadOrders(document.getElementById('orderSearch').value, false));

    // Load All buttons
    document.getElementById('loadAllCustomersBtn').addEventListener('click', () => loadCustomers('', true));
    document.getElementById('loadAllProductsBtn').addEventListener('click', () => loadProducts('', true));
    document.getElementById('loadAllOrdersBtn').addEventListener('click', () => loadOrders('', true));

    // Enter key triggers search (limit 100)
    document.getElementById('customerSearch').addEventListener('keypress', (e) => { if(e.key === 'Enter') loadCustomers(e.target.value, false); });
    document.getElementById('productSearch').addEventListener('keypress', (e) => { if(e.key === 'Enter') loadProducts(e.target.value, false); });
    document.getElementById('orderSearch').addEventListener('keypress', (e) => { if(e.key === 'Enter') loadOrders(e.target.value, false); });

    // Inventory Insights tab
    document.getElementById('inventory-tab').addEventListener('click', loadInventoryInsights);
});

// ========================
// Customers
// ========================
async function loadCustomers(search = '', loadAll = false) {
    const url = search ? `/api/customers?search=${encodeURIComponent(search)}&all=${loadAll}` : `/api/customers?all=${loadAll}`;
    try {
        const res = await fetch(url);
        const customers = await res.json();
        const tbody = document.querySelector('#customersTable tbody');
        if (!customers.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No customers found</td></tr>';
            return;
        }
        tbody.innerHTML = customers.map(c => `
            <tr>
                <td>${c.customer_id}</td><td>${c.customer_name}</td><td>${c.segment}</td>
                <td>${c.city}</td><td>${c.state}</td><td>${c.region}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading customers:', err);
    }
}

// ========================
// Products
// ========================
async function loadProducts(search = '', loadAll = false) {
    const url = search ? `/api/products?search=${encodeURIComponent(search)}&all=${loadAll}` : `/api/products?all=${loadAll}`;
    try {
        const res = await fetch(url);
        const products = await res.json();
        const tbody = document.querySelector('#productsTable tbody');
        if (!products.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No products found</td></tr>';
            return;
        }
        tbody.innerHTML = products.map(p => `
            <tr>
                <td>${p.product_id}</td><td>${p.product_name}</td><td>${p.category}</td>
                <td>${p.sub_category}</td><td>$${p.price}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading products:', err);
    }
}

// ========================
// Orders
// ========================
async function loadOrders(search = '', loadAll = false) {
    const url = search ? `/api/orders?search=${encodeURIComponent(search)}&all=${loadAll}` : `/api/orders?all=${loadAll}`;
    try {
        const res = await fetch(url);
        const orders = await res.json();
        const tbody = document.querySelector('#ordersTable tbody');
        if (!orders.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders found</td></tr>';
            return;
        }
        tbody.innerHTML = orders.map(o => `
            <tr>
                <td>${o.order_id}</td><td>${o.customer_name}</td><td>${o.order_date}</td>
                <td><span class="badge ${o.status === 'Delivered' ? 'bg-success' : (o.status === 'Shipped' ? 'bg-info' : 'bg-warning')}">${o.status}</span></td>
                <td><button class="btn btn-sm btn-outline-primary" onclick="viewOrderItems('${o.order_id}')"><i class="fas fa-eye"></i> View Items</button></td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading orders:', err);
    }
}

async function viewOrderItems(orderId) {
    try {
        const res = await fetch(`/api/order_items/${orderId}`);
        const items = await res.json();
        const tbody = document.querySelector('#itemsTable tbody');
        if (!items.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No items in this order</td></tr>';
        } else {
            tbody.innerHTML = items.map(i => `
                <tr><td>${i.product_name}</td><td>${i.quantity}</td><td>$${i.sales}</td><td>$${i.profit}</td></tr>
            `).join('');
        }
        const modal = new bootstrap.Modal(document.getElementById('orderItemsModal'));
        modal.show();
    } catch (err) {
        console.error('Error loading order items:', err);
    }
}

// ========================
// Sales Report with Charts
// ========================
async function loadSalesReport() {
    try {
        const res = await fetch('/api/sales_report');
        const report = await res.json();
        const tbody = document.querySelector('#reportTable tbody');
        if (!report.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No sales data</td></tr>';
            return;
        }
        tbody.innerHTML = report.map(r => `
            <tr><td>${r.category}</td><td>$${r.total_sales}</td><td>$${r.total_profit}</td><td>${r.order_count}</td></tr>
        `).join('');

        const categories = report.map(r => r.category);
        const sales = report.map(r => r.total_sales);
        const profits = report.map(r => r.total_profit);

        if (salesChart) salesChart.destroy();
        if (profitChart) profitChart.destroy();

        // Bar chart
        const ctxBar = document.getElementById('salesChart').getContext('2d');
        salesChart = new Chart(ctxBar, {
            type: 'bar',
            data: { labels: categories, datasets: [{ label: 'Total Sales ($)', data: sales, backgroundColor: 'rgba(54, 162, 235, 0.6)' }] },
            options: { responsive: true }
        });

        // Pie chart
        const ctxPie = document.getElementById('profitChart').getContext('2d');
        profitChart = new Chart(ctxPie, {
            type: 'pie',
            data: { labels: categories, datasets: [{ data: profits, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'] }] },
            options: { responsive: true }
        });
    } catch (err) {
        console.error('Error loading sales report:', err);
    }
}

// ========================
// Inventory Insights (no chart, only tables)
// ========================
async function loadInventoryInsights() {
    try {
        const res = await fetch('/api/inventory_insights');
        if (!res.ok) throw new Error('Failed to fetch insights');
        const data = await res.json();

        // Low profit table
        const lowTable = document.querySelector('#lowProfitTable tbody');
        if (data.low_profit && data.low_profit.length) {
            lowTable.innerHTML = data.low_profit.map(p => `
                <tr><td>${p.product_name}</td><td>$${p.total_sales}</td><td>$${p.total_profit}</td><td>${p.profit_margin}%</td></tr>
            `).join('');
        } else {
            lowTable.innerHTML = '<tr><td colspan="4">No low profit products found</td></tr>';
        }

        // Never sold table
        const neverTable = document.querySelector('#neverSoldTable tbody');
        if (data.never_sold && data.never_sold.length) {
            neverTable.innerHTML = data.never_sold.map(p => `
                <tr><td>${p.product_id}</td><td>${p.product_name}</td><td>${p.category}</td><td>$${p.price}</td></tr>
            `).join('');
        } else {
            neverTable.innerHTML = '<tr><td colspan="4">All products have been sold at least once</td></tr>';
        }

        // Summary
        const sold = data.sold_products || 0;
        const total = data.total_products || 0;
        const rate = total ? ((sold / total) * 100).toFixed(1) : 0;
        document.getElementById('inventorySummary').innerHTML = `${sold} sold out of ${total} total products<br><small>${rate}% sell‑through rate</small>`;
    } catch (err) {
        console.error('Inventory insights error:', err);
        document.getElementById('inventorySummary').innerHTML = 'Error loading data';
        document.querySelector('#lowProfitTable tbody').innerHTML = '<tr><td colspan="4">Failed to load</td></tr>';
        document.querySelector('#neverSoldTable tbody').innerHTML = '<tr><td colspan="4">Failed to load</td></tr>';
    }
}