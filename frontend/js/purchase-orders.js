// js/purchase-orders.js
initPage('purchase-orders.html');

let products = [];  // Cache product list for dropdowns

// Set today's date as default
document.getElementById('po_date').valueAsDate = new Date();

async function init() {
    // Load suppliers
    const suppliers = await apiGet('/suppliers');
    const sel = document.getElementById('po_supplier');
    suppliers.forEach(s => {
        const o = document.createElement('option');
        o.value = s.supplier_id; o.textContent = s.name;
        sel.appendChild(o);
    });

    // Cache products for item rows
    products = await apiGet('/products');

    // Add first empty item row
    addItemRow('po');

    // Load existing orders
    loadOrders();
}

// Add a product row to the order items table
function addItemRow(prefix) {
    const tbody = document.getElementById(prefix + 'Items');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>
            <select class="item-product" required>
                <option value="">-- Product --</option>
                ${products.map(p => `<option value="${p.product_id}" data-price="${p.price}">${p.name}</option>`).join('')}
            </select>
        </td>
        <td><input type="number" class="item-qty" value="1" min="1" required></td>
        <td><input type="number" class="item-price" value="0" min="0" step="0.01" required></td>
        <td><button type="button" class="btn btn-danger btn-sm" onclick="this.closest('tr').remove()">✕</button></td>
    `;
    // Auto-fill price from product selection
    tr.querySelector('.item-product').addEventListener('change', function() {
        const opt = this.options[this.selectedIndex];
        tr.querySelector('.item-price').value = opt.dataset.price || 0;
    });
    tbody.appendChild(tr);
}

// Form submit
document.getElementById('poForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const supplier_id = document.getElementById('po_supplier').value;
    const date        = document.getElementById('po_date').value;
    const status      = document.getElementById('po_status').value;

    // Collect item rows
    const items = [];
    document.querySelectorAll('#poItems tr').forEach(tr => {
        const product_id = tr.querySelector('.item-product').value;
        const quantity   = tr.querySelector('.item-qty').value;
        const price      = tr.querySelector('.item-price').value;
        if (product_id) items.push({ product_id, quantity: parseInt(quantity), price: parseFloat(price) });
    });

    if (items.length === 0) return showMsg('msg', 'Add at least one item.', 'error');

    try {
        const res = await apiPost('/purchase-orders', { supplier_id, date, status, items });
        showMsg('msg', `Purchase Order #${res.purchase_id} created!`);
        document.getElementById('poForm').reset();
        document.getElementById('po_date').valueAsDate = new Date();
        document.getElementById('poItems').innerHTML = '';
        addItemRow('po');
        loadOrders();
    } catch (err) { showMsg('msg', err.message, 'error'); }
});

// Load orders table
async function loadOrders() {
    const data = await apiGet('/purchase-orders');
    const tbody = document.getElementById('poTable');
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No orders yet.</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(o => `
        <tr>
            <td>#${o.purchase_id}</td>
            <td>${o.supplier_name || '–'}</td>
            <td>${o.date ? o.date.substring(0,10) : '–'}</td>
            <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
        </tr>`).join('');
}

init();
