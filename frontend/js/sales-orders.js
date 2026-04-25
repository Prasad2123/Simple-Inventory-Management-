// js/sales-orders.js
initPage('sales-orders.html');

let products = [];

document.getElementById('so_date').valueAsDate = new Date();

async function init() {
    const customers = await apiGet('/customers');
    const sel = document.getElementById('so_customer');
    customers.forEach(c => {
        const o = document.createElement('option');
        o.value = c.customer_id; o.textContent = c.name;
        sel.appendChild(o);
    });

    products = await apiGet('/products');
    addSoRow();
    loadOrders();
}

function addSoRow() {
    const tbody = document.getElementById('soItems');
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
        <td><button type="button" class="btn btn-danger btn-sm" onclick="this.closest('tr').remove();updateTotal()">✕</button></td>
    `;
    // Auto-fill price from selected product
    tr.querySelector('.item-product').addEventListener('change', function() {
        const opt = this.options[this.selectedIndex];
        tr.querySelector('.item-price').value = opt.dataset.price || 0;
        updateTotal();
    });
    tr.querySelector('.item-qty').addEventListener('input', updateTotal);
    tr.querySelector('.item-price').addEventListener('input', updateTotal);
    tbody.appendChild(tr);
}

// Re-calculate running total
function updateTotal() {
    let total = 0;
    document.querySelectorAll('#soItems tr').forEach(tr => {
        const qty   = parseFloat(tr.querySelector('.item-qty')?.value || 0);
        const price = parseFloat(tr.querySelector('.item-price')?.value || 0);
        total += qty * price;
    });
    document.getElementById('soTotal').textContent = total.toFixed(2);
}

document.getElementById('soForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const customer_id = document.getElementById('so_customer').value;
    const date        = document.getElementById('so_date').value;
    const status      = document.getElementById('so_status').value;

    const items = [];
    document.querySelectorAll('#soItems tr').forEach(tr => {
        const product_id = tr.querySelector('.item-product').value;
        const quantity   = tr.querySelector('.item-qty').value;
        const price      = tr.querySelector('.item-price').value;
        if (product_id) items.push({ product_id, quantity: parseInt(quantity), price: parseFloat(price) });
    });

    if (items.length === 0) return showMsg('msg', 'Add at least one item.', 'error');

    try {
        const res = await apiPost('/sales-orders', { customer_id, date, status, items });
        showMsg('msg', `Sales Order #${res.sales_id} created! You can now generate an invoice.`);
        document.getElementById('soForm').reset();
        document.getElementById('so_date').valueAsDate = new Date();
        document.getElementById('soItems').innerHTML = '';
        document.getElementById('soTotal').textContent = '0.00';
        addSoRow();
        loadOrders();
    } catch (err) { showMsg('msg', err.message, 'error'); }
});

async function loadOrders() {
    const data = await apiGet('/sales-orders');
    const tbody = document.getElementById('soTable');
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No orders yet.</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(o => `
        <tr>
            <td>#${o.sales_id}</td>
            <td>${o.customer_name || '–'}</td>
            <td>${o.date ? o.date.substring(0,10) : '–'}</td>
            <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
        </tr>`).join('');
}

init();
