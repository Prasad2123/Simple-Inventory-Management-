// js/payments.js
initPage('payments.html');

document.getElementById('pay_date').valueAsDate = new Date();

async function init() {
    // Load invoices for dropdown
    const invoices = await apiGet('/invoices');
    const sel = document.getElementById('pay_invoice');
    invoices.forEach(i => {
        const opt = document.createElement('option');
        opt.value = i.invoice_id;
        opt.textContent = `Invoice #${i.invoice_id} – ${i.customer_name} (₹${Number(i.total_amount).toLocaleString('en-IN')})`;
        // Auto-fill amount when invoice selected
        opt.dataset.amount = i.total_amount;
        sel.appendChild(opt);
    });

    // Auto-fill amount when invoice is chosen
    sel.addEventListener('change', function() {
        const opt = this.options[this.selectedIndex];
        document.getElementById('pay_amount').value = opt.dataset.amount || '';
    });

    loadPayments();
}

document.getElementById('payForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const invoice_id = document.getElementById('pay_invoice').value;
    const amount     = document.getElementById('pay_amount').value;
    const method     = document.getElementById('pay_method').value;
    const date       = document.getElementById('pay_date').value;
    try {
        const res = await apiPost('/payments', { invoice_id, amount, method, date });
        showMsg('msg', `Payment #${res.payment_id} recorded successfully!`);
        document.getElementById('payForm').reset();
        document.getElementById('pay_date').valueAsDate = new Date();
        loadPayments();
    } catch (err) { showMsg('msg', err.message, 'error'); }
});

async function loadPayments() {
    const data = await apiGet('/payments');
    const tbody = document.getElementById('payTable');
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No payments recorded yet.</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(p => `
        <tr>
            <td>#${p.payment_id}</td>
            <td>Inv #${p.invoice_id}</td>
            <td>${p.customer_name || '–'}</td>
            <td>₹${Number(p.amount).toLocaleString('en-IN')}</td>
            <td>${p.method}</td>
            <td>${p.date ? p.date.substring(0,10) : '–'}</td>
        </tr>`).join('');
}

init();
