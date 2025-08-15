const socket = io();
const productsContainer = document.getElementById('products-container');
const addForm = document.getElementById('add-product-form');
const deleteForm = document.getElementById('delete-product-form');

let products = [];

const renderProducts = (productList) => {
    products = productList;
    productsContainer.innerHTML = '';
    
    if (products.length === 0) {
        productsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                <h3>No hay productos para mostrar</h3>
                <p class="text-muted">Agrega tu primer producto usando el formulario de abajo.</p>
            </div>
        `;
        return;
    }

    const productGrid = document.createElement('div');
    productGrid.className = 'product-grid';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-card-header">
                <h4 class="product-title">${product.title}</h4>
                <span class="product-id">ID: ${product._id}</span>
            </div>
            <div class="product-card-body">
                <p class="product-description">${product.description}</p>
                <div class="product-details">
                    <div class="detail-item">
                        <strong>Código:</strong> ${product.code}
                    </div>
                    <div class="detail-item">
                        <strong>Precio:</strong> $${product.price.toLocaleString()}
                    </div>
                    <div class="detail-item">
                        <strong>Stock:</strong> ${product.stock} unidades
                    </div>
                    <div class="detail-item">
                        <strong>Categoría:</strong> ${product.category}
                    </div>
                </div>
                <div class="product-status">
                    <span class="badge ${product.status ? 'badge-success' : 'badge-danger'}">
                        ${product.status ? 'Disponible' : 'No disponible'}
                    </span>
                </div>
            </div>
            <div class="product-card-footer">
                <button class="btn btn-danger btn-sm" onclick="confirmDeleteProduct('${product._id}', '${product.title}')">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
    
    productsContainer.appendChild(productGrid);
};

const confirmDeleteProduct = async (productId, productTitle) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Quieres eliminar "${productTitle}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        socket.emit('delete-product', productId);
    }
};

socket.on('connect', () => {
    console.log('Conectado al servidor');
    socket.emit('request-products');
});

socket.on('products-updated', (productList) => {
    renderProducts(productList);
});

socket.on('product-added', (data) => {
    Swal.fire({
        icon: 'success',
        title: '¡Producto agregado!',
        text: data.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
    });
});

socket.on('product-deleted', (data) => {
    Swal.fire({
        icon: 'success',
        title: 'Producto eliminado',
        text: data.message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
    });
});

socket.on('product-error', (data) => {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.message,
    });
});

socket.on('error', (message) => {
    Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: message,
    });
});

addForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(addForm);
    const thumbnailsInput = formData.get('thumbnails');
    
    const newProduct = {
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        code: formData.get('code').trim(),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        category: formData.get('category').trim(),
        thumbnails: thumbnailsInput ? thumbnailsInput.split(',').map(url => url.trim()).filter(url => url) : []
    };

    const validationErrors = [];
    
    if (!newProduct.title) validationErrors.push('Título es requerido');
    if (!newProduct.description) validationErrors.push('Descripción es requerida');
    if (!newProduct.code) validationErrors.push('Código es requerido');
    if (isNaN(newProduct.price) || newProduct.price <= 0) validationErrors.push('Precio debe ser mayor a 0');
    if (isNaN(newProduct.stock) || newProduct.stock < 0) validationErrors.push('Stock debe ser mayor o igual a 0');
    if (!newProduct.category) validationErrors.push('Categoría es requerida');

    if (validationErrors.length > 0) {
        Swal.fire({
            icon: 'error',
            title: 'Errores de validación',
            html: validationErrors.map(error => `• ${error}`).join('<br>'),
        });
        return;
    }

    const existingProduct = products.find(p => p.code === newProduct.code);
    if (existingProduct) {
        Swal.fire({
            icon: 'error',
            title: 'Código duplicado',
            text: 'Ya existe un producto con ese código.',
        });
        return;
    }

    socket.emit('add-product', newProduct);
    addForm.reset();
});

deleteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value.trim();
    
    if (!productId) {
        Swal.fire({ 
            icon: 'error', 
            title: 'Error', 
            text: 'Por favor, ingresa el ID de un producto.' 
        });
        return;
    }

    const product = products.find(p => p._id === productId);
    if (!product) {
        Swal.fire({ 
            icon: 'error', 
            title: 'Producto no encontrado', 
            text: 'No existe un producto con ese ID.' 
        });
        return;
    }

    confirmDeleteProduct(productId, product.title);
    deleteForm.reset();
});

const numericInputs = ['price', 'stock'];
numericInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener('input', (event) => {
            if (inputId === 'price') {
                event.target.value = event.target.value.replace(/[^0-9.]/g, '');
            } else {
                event.target.value = event.target.value.replace(/[^0-9]/g, '');
            }
        });
    }
});

const codeInput = document.getElementById('code');
if (codeInput) {
    codeInput.addEventListener('input', (event) => {
        event.target.value = event.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    });
}

socket.emit('request-products');