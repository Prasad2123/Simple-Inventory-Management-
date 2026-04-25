// js/customers.js
initPage('customers.html');

async function loadCustomers() {
    const data = await apiGet('/customers');
    const tbody = document.getElementById('customerTable');
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No customers found.</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(c => `
        <tr>
            <td>${c.customer_id}</td>
            <td>${c.name}</td>
            <td>${c.contact || '–'}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editCustomer(${c.customer_id})">Edit</button>
                <button class="btn btn-danger  btn-sm" onclick="deleteCustomer(${c.customer_id})">Delete</button>
            </td>
        </tr>`).join('');
}

document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id      = document.getElementById('customer_id').value;
    const name    = document.getElementById('c_name').value;
    const contact = document.getElementById('c_contact').value;
    try {
        if (id) { await apiPut('/customers/' + id, { name, contact }); showMsg('msg', 'Customer updated!'); }
        else     { await apiPost('/customers', { name, contact });      showMsg('msg', 'Customer added!'); }
        resetForm(); loadCustomers();
    } catch (err) { showMsg('msg', err.message, 'error'); }
});

async function editCustomer(id) {
    const c = await apiGet('/customers/' + id);
    document.getElementById('customer_id').value = c.customer_id;
    document.getElementById('c_name').value      = c.name;
    document.getElementById('c_contact').value   = c.contact || '';
    document.getElementById('form-title').textContent  = 'Edit Customer';
    document.getElementById('submitBtn').textContent   = 'Update Customer';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    window.scrollTo(0, 0);
}

async function deleteCustomer(id) {
    if (!confirm('Delete this customer?')) return;
    try { await apiDelete('/customers/' + id); showMsg('msg', 'Deleted.'); loadCustomers(); }
    catch (err) { showMsg('msg', err.message, 'error'); }
}

function resetForm() {
    document.getElementById('customerForm').reset();
    document.getElementById('customer_id').value = '';
    document.getElementById('form-title').textContent  = 'Add Customer';
    document.getElementById('submitBtn').textContent   = 'Add Customer';
    document.getElementById('cancelBtn').style.display = 'none';
}

loadCustomers();
