// js/invoices.js
initPage('invoices.html');

document.getElementById('inv_date').valueAsDate = new Date();

async function init() {
    // Load all sales orders for the dropdown
    const orders = await apiGet('/sales-orders');
    const sel = document.getElementById('inv_sales');
    orders.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.sales_id;
        opt.textContent = `#${o.sales_id} – ${o.customer_name} (${o.date ? o.date.substring(0,10) : ''})`;
        sel.appendChild(opt);
    });

    loadInvoices();
}

document.getElementById('invForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const sales_id = document.getElementById('inv_sales').value;
    const date     = document.getElementById('inv_date').value;
    try {
        const res = await apiPost('/invoices', { sales_id, date });
        showMsg('msg', `Invoice #${res.invoice_id} generated! Total: ₹${Number(res.total_amount).toLocaleString('en-IN')}`);
        document.getElementById('invForm').reset();
        document.getElementById('inv_date').valueAsDate = new Date();
        loadInvoices();
    } catch (err) { showMsg('msg', err.message, 'error'); }
});

async function loadInvoices() {
    const data = await apiGet('/invoices');
    const tbody = document.getElementById('invTable');
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No invoices yet.</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(i => `
        <tr>
            <td>#${i.invoice_id}</td>
            <td>SO #${i.sales_id}</td>
            <td>${i.customer_name || '–'}</td>
            <td>${i.date ? i.date.substring(0,10) : '–'}</td>
            <td>₹${Number(i.total_amount).toLocaleString('en-IN')}</td>
        </tr>`).join('');
}

init();
