// Cargar productos y mostrarlos en la tabla
function loadProducts() {
    fetch('https://panaderia-esperanza.onrender.com/productos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener productos: ' + response.status);
            }
            return response.json();
        })
        .then(productos => {
            const tbody = document.getElementById('productTableBody');
            tbody.innerHTML = ''; // Limpiar la tabla

            // Agregar productos a la tabla
            productos.forEach(producto => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${producto.nombre}</td>
                    <td>${producto.tipo}</td>
                    <td>$${producto.precio}</td>
                    <td>${producto.cantidad}</td>
                    <td><img src="${producto.imagen_url}" alt="${producto.nombre}" class="img-thumbnail table-img"></td>
                    <td>
                        <button class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#editModal" onclick="editProduct(${producto.producto_id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${producto.producto_id})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

// Llamar a loadProducts cuando se carga la página
document.addEventListener('DOMContentLoaded', loadProducts);

// Validar y agregar producto
function validateForm() {
    const productName = document.getElementById("productName").value.trim();
    const productType = document.getElementById("productType").value;
    const productPrice = document.getElementById("productPrice").value.trim();
    const productQuantity = document.getElementById("productQuantity").value.trim();
    const productImageUrl = document.getElementById("productImageUrl").value.trim();

    let valid = true;
    let errorMessage = "";

    if (!productName) {
        errorMessage += "El nombre del producto es obligatorio.\n";
        valid = false;
    }
    if (productType === "") {
        errorMessage += "Seleccione un tipo de producto.\n";
        valid = false;
    }
    if (!productPrice || productPrice < 1 || productPrice > 10000) {
        errorMessage += "El precio debe estar entre $1 y $10,000.\n";
        valid = false;
    }
    if (!productQuantity || productQuantity < 1 || productQuantity > 100) {
        errorMessage += "La cantidad debe estar entre 1 y 100 unidades.\n";
        valid = false;
    }
    if (!productImageUrl) {
        errorMessage += "La URL de la imagen es obligatoria.\n";
        valid = false;
    }

    if (valid) {
        const productData = {
            nombre: productName,
            tipo: productType,
            precio: parseFloat(productPrice),
            cantidad: parseInt(productQuantity, 10),
            imagen_url: productImageUrl
        };

        fetch('/agregarProducto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(errorMessage => {
                    alert(errorMessage); // Mostrar el mensaje de error adecuado
                });
            }
            return response.text(); // Si no hay error, mostrar el mensaje de éxito
        })
        .then(data => {
            if (data) { // Mostrar solo si hay una respuesta válida
                alert(data);
                document.getElementById("productForm").reset();
                loadProducts(); // Recargar productos
            }
        })
        .catch(error => {
            alert('Error: ' + error.message); // Captura otros errores no relacionados con el servidor
        });
    } else {
        alert(errorMessage);
    }
}



let productToDeleteId;

// Abrir modal de eliminación
function openDeleteModal(id) {
    productToDeleteId = id;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

// Eliminar producto
function deleteProduct() {
    if (!productToDeleteId) return;

    fetch(`/eliminarProducto/${productToDeleteId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al eliminar el producto: ' + response.status);
        }
        return response.text();
    })
    .then(data => {
        alert(data);
        loadProducts();
    })
    .catch(error => {
        alert('Error: ' + error.message);
    });
}

// Ver detalles del producto
function viewProduct(id) {
    fetch(`/productos/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el producto: ' + response.status);
            }
            return response.json();
        })
        .then(producto => {
            document.getElementById('viewProductName').textContent = producto.nombre;
            document.getElementById('viewProductType').textContent = producto.tipo;
            document.getElementById('viewProductPrice').textContent = `$${producto.precio}`;
            document.getElementById('viewProductQuantity').textContent = producto.cantidad;
            document.getElementById('viewProductImage').src = producto.imagen_url;
            const viewModal = new bootstrap.Modal(document.getElementById('viewModal'));
            viewModal.show();
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

let currentProductId;

// Editar producto
function editProduct(id) {
    currentProductId = id;

    fetch(`/productos/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el producto: ' + response.status);
            }
            return response.json();
        })
        .then(producto => {
            document.getElementById('editProductName').value = producto.nombre;
            document.getElementById('editProductType').value = producto.tipo;
            document.getElementById('editProductPrice').value = producto.precio;
            document.getElementById('editProductQuantity').value = producto.cantidad;
            document.getElementById('editProductImageUrl').value = producto.imagen_url;
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

// Actualizar producto
// Actualizar producto
function updateProduct() {
    const productData = {
        nombre: document.getElementById("editProductName").value.trim(),
        tipo: document.getElementById("editProductType").value,
        precio: document.getElementById("editProductPrice").value.trim(),
        cantidad: document.getElementById("editProductQuantity").value.trim(),
        imagen_url: document.getElementById("editProductImageUrl").value.trim()
    };

    let valid = true;
    let errorMessage = "";

    // Validación del nombre
    if (!productData.nombre) {
        errorMessage += "El nombre del producto es obligatorio.\n";
        valid = false;
    }

    // Validación del tipo
    if (productData.tipo === "") {
        errorMessage += "Seleccione un tipo de producto.\n";
        valid = false;
    }

    // Validación del precio (debe ser un número entero dentro del rango permitido)
    if (!productData.precio || !Number.isInteger(Number(productData.precio)) || Number(productData.precio) < 1 || Number(productData.precio) > 10000) {
        errorMessage += "El precio debe ser un número entero entre $1 y $10,000.\n";
        valid = false;
    }

    // Validación de la cantidad (debe ser un número entero dentro del rango permitido)
    if (!productData.cantidad || !Number.isInteger(Number(productData.cantidad)) || Number(productData.cantidad) < 1 || Number(productData.cantidad) > 100) {
        errorMessage += "La cantidad debe ser un número entero entre 1 y 100 unidades.\n";
        valid = false;
    }

    // Validación de la URL de la imagen
    if (!productData.imagen_url) {
        errorMessage += "La URL de la imagen es obligatoria.\n";
        valid = false;
    }

    // Si todos los campos son válidos, proceder con la actualización
    if (valid) {
        // Convertir el precio y cantidad a números enteros antes de enviarlos al servidor
        productData.precio = parseInt(productData.precio, 10);
        productData.cantidad = parseInt(productData.cantidad, 10);

        fetch(`/editarProducto/${currentProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al actualizar el producto: ' + response.status);
            }
            return response.text();
        })
        .then(data => {
            alert(data);
            loadProducts();
            document.getElementById("editProductForm").reset();
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            editModal.hide();
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
    } else {
        alert(errorMessage);
    }
}



