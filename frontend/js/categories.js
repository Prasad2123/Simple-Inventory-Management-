// js/categories.js
initPage('categories.html');

async function loadCategories() {
    const data = await apiGet('/categories');
    const tbody = document.getElementById('catTable');
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">No categories found.</td></tr>';
        return;
    }
    tbody.innerHTML = data.map(c => `
        <tr>
            <td>${c.category_id}</td>
            <td>${c.name}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editCat(${c.category_id},'${c.name}')">Edit</button>
                <button class="btn btn-danger  btn-sm" onclick="deleteCat(${c.category_id})">Delete</button>
            </td>
        </tr>`).join('');
}

document.getElementById('catForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id   = document.getElementById('cat_id').value;
    const name = document.getElementById('cat_name').value;
    try {
        if (id) { await apiPut('/categories/' + id, { name }); showMsg('msg', 'Category updated!'); }
        else     { await apiPost('/categories', { name });      showMsg('msg', 'Category added!'); }
        resetForm(); loadCategories();
    } catch (err) { showMsg('msg', err.message, 'error'); }
});

function editCat(id, name) {
    document.getElementById('cat_id').value    = id;
    document.getElementById('cat_name').value  = name;
    document.getElementById('form-title').textContent  = 'Edit Category';
    document.getElementById('submitBtn').textContent   = 'Update';
    document.getElementById('cancelBtn').style.display = 'inline-block';
}

async function deleteCat(id) {
    if (!confirm('Delete this category?')) return;
    try { await apiDelete('/categories/' + id); showMsg('msg', 'Deleted.'); loadCategories(); }
    catch (err) { showMsg('msg', err.message, 'error'); }
}

function resetForm() {
    document.getElementById('catForm').reset();
    document.getElementById('cat_id').value = '';
    document.getElementById('form-title').textContent  = 'Add Category';
    document.getElementById('submitBtn').textContent   = 'Add';
    document.getElementById('cancelBtn').style.display = 'none';
}

loadCategories();
