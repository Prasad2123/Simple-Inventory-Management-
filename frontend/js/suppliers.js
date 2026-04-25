// js/suppliers.js
initPage('suppliers.html');

async function loadSuppliers() {
    const data = await apiGet('/suppliers');
    const tbody = document.getElementById('supplierTable');
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No suppliers found.</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(s => `
        <tr>
            <td>${s.supplier_id}</td>
            <td>${s.name}</td>
            <td>${s.contact || '–'}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editSupplier(${s.supplier_id})">Edit</button>
                <button class="btn btn-danger  btn-sm" onclick="deleteSupplier(${s.supplier_id})">Delete</button>
            </td>
        </tr>`).join('');
}

document.getElementById('supplierForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id      = document.getElementById('supplier_id').value;
    const name    = document.getElementById('s_name').value;
    const contact = document.getElementById('s_contact').value;
    try {
        if (id) { await apiPut('/suppliers/' + id, { name, contact }); showMsg('msg', 'Supplier updated!'); }
        else     { await apiPost('/suppliers', { name, contact });      showMsg('msg', 'Supplier added!'); }
        resetForm(); loadSuppliers();
    } catch (err) { showMsg('msg', err.message, 'error'); }
});

async function editSupplier(id) {
    const s = await apiGet('/suppliers/' + id);
    document.getElementById('supplier_id').value = s.supplier_id;
    document.getElementById('s_name').value      = s.name;
    document.getElementById('s_contact').value   = s.contact || '';
    document.getElementById('form-title').textContent  = 'Edit Supplier';
    document.getElementById('submitBtn').textContent   = 'Update Supplier';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    window.scrollTo(0, 0);
}

async function deleteSupplier(id) {
    if (!confirm('Delete this supplier?')) return;
    try { await apiDelete('/suppliers/' + id); showMsg('msg', 'Deleted.'); loadSuppliers(); }
    catch (err) { showMsg('msg', err.message, 'error'); }
}

function resetForm() {
    document.getElementById('supplierForm').reset();
    document.getElementById('supplier_id').value = '';
    document.getElementById('form-title').textContent  = 'Add Supplier';
    document.getElementById('submitBtn').textContent   = 'Add Supplier';
    document.getElementById('cancelBtn').style.display = 'none';
}

loadSuppliers();
