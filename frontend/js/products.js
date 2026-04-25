// js/products.js  –  Logic for products.html

initPage('products.html');

// Load dropdown options on page load
async function loadDropdowns() {
    const [cats, brands, units] = await Promise.all([
        apiGet('/categories'),
        apiGet('/brands'),
        apiGet('/units')
    ]);
    fillSelect('category_id', cats, 'category_id', 'name');
    fillSelect('brand_id',    brands, 'brand_id', 'name');
    fillSelect('unit_id',     units, 'unit_id', 'name');
}

// Helper: fill a <select> from an array
function fillSelect(selectId, data, valueKey, labelKey) {
    const sel = document.getElementById(selectId);
    data.forEach(row => {
        const opt = document.createElement('option');
        opt.value       = row[valueKey];
        opt.textContent = row[labelKey];
        sel.appendChild(opt);
    });
}

// Load and render products table
async function loadProducts() {
    const products = await apiGet('/products');
    const tbody = document.getElementById('productTable');
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found.</td></tr>';
        return;
    }
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.product_id}</td>
            <td>${p.name}</td>
            <td>${p.category || '–'}</td>
            <td>${p.brand || '–'}</td>
            <td>${p.unit || '–'}</td>
            <td>₹${Number(p.price).toLocaleString('en-IN')}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editProduct(${p.product_id})">Edit</button>
                <button class="btn btn-danger  btn-sm" onclick="deleteProduct(${p.product_id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Form submit – create or update
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('product_id').value;
    const data = {
        name:        document.getElementById('name').value,
        description: document.getElementById('description').value,
        price:       document.getElementById('price').value,
        category_id: document.getElementById('category_id').value || null,
        brand_id:    document.getElementById('brand_id').value    || null,
        unit_id:     document.getElementById('unit_id').value     || null
    };

    try {
        if (id) {
            await apiPut('/products/' + id, data);
            showMsg('msg', 'Product updated successfully!');
        } else {
            await apiPost('/products', data);
            showMsg('msg', 'Product added successfully!');
        }
        resetForm();
        loadProducts();
    } catch (err) {
        showMsg('msg', err.message, 'error');
    }
});

// Populate form for editing
async function editProduct(id) {
    const p = await apiGet('/products/' + id);
    document.getElementById('product_id').value  = p.product_id;
    document.getElementById('name').value         = p.name;
    document.getElementById('price').value        = p.price;
    document.getElementById('description').value  = p.description || '';
    document.getElementById('category_id').value  = p.category_id || '';
    document.getElementById('brand_id').value     = p.brand_id    || '';
    document.getElementById('unit_id').value      = p.unit_id     || '';
    document.getElementById('form-title').textContent = 'Edit Product';
    document.getElementById('submitBtn').textContent  = 'Update Product';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    window.scrollTo(0, 0);
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    try {
        await apiDelete('/products/' + id);
        showMsg('msg', 'Product deleted.');
        loadProducts();
    } catch (err) {
        showMsg('msg', err.message, 'error');
    }
}

// Reset form to "add" mode
function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('product_id').value = '';
    document.getElementById('form-title').textContent    = 'Add New Product';
    document.getElementById('submitBtn').textContent     = 'Add Product';
    document.getElementById('cancelBtn').style.display   = 'none';
}

// Init
loadDropdowns();
loadProducts();
