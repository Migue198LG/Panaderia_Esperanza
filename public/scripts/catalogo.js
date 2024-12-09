document.addEventListener("DOMContentLoaded", loadProducts);

// Función para cargar productos desde el backend
function loadProducts() {
    const userId = localStorage.getItem('userId');  // Obtener el ID del usuario desde localStorage

    if (!userId) {
        alert("Debes iniciar sesión primero.");
        window.location.href = 'login.html';  // Redirigir a la página de login si no hay usuario logueado
        return;
    }

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

            productos.forEach(producto => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${producto.nombre}</td>
                    <td>${producto.tipo}</td>
                    <td>$${producto.precio}</td>
                    <td>${producto.cantidad}</td>
                    <td><img src="${producto.imagen_url}" alt="${producto.nombre}" class="img-thumbnail table-img"></td>
                    <td>
                        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#buyModal" onclick="openBuyModal(${producto.producto_id}, '${producto.nombre}', ${producto.cantidad}, ${producto.precio})">Comprar</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

// Función para abrir el modal de compra y generar el ticket
function openBuyModal(id, nombre, maxCantidad, precio) {
    document.getElementById('buyProductId').value = id;
    document.getElementById('buyProductName').textContent = `Comprar: ${nombre}`;
    const inputCantidad = document.getElementById('buyProductQuantity');
    inputCantidad.max = maxCantidad;
    inputCantidad.value = 1; // Valor predeterminado
    inputCantidad.min = 1; // Asegurarse de que la cantidad mínima sea 1
    document.getElementById('ticketInfo').innerHTML = ''; // Limpiar el ticket

    // Guardar la información del producto para el ticket
    window.productInfo = { id, nombre, precio, cantidad: 1 };

    // Llamar a la función para cargar los fondos y generar el ticket
    loadUserFundsAndGenerateTicket();
}

// Función para generar el ticket de compra
function generateTicket() {
    const inputCantidad = document.getElementById('buyProductQuantity');
    const cantidad = inputCantidad.value.trim();
    const maxCantidad = inputCantidad.max;
    const ticketContainer = document.getElementById('ticketInfo'); // Contenedor del ticket

    // Ocultar el ticket inicialmente
    ticketContainer.style.display = 'none';

    // Validación de la cantidad ingresada (solo enteros y mayor que 0)
    const cantidadValida = /^[1-9]\d*$/;  // Solo enteros positivos
    if (!cantidadValida.test(cantidad) || cantidad <= 0) {
        alert('Por favor ingresa una cantidad válida (número entero mayor que 0).');
        inputCantidad.focus();
        return;
    }

    if (parseInt(cantidad) > maxCantidad) {
        alert('La cantidad no puede ser mayor a la cantidad disponible.');
        inputCantidad.focus();
        return;
    }

    // Calcular el total
    const total = window.productInfo.precio * parseInt(cantidad);
    window.productInfo.cantidad = parseInt(cantidad);

    // Mostrar el ticket con la cantidad y total
    ticketContainer.style.display = 'block'; // Mostrar el ticket
    loadUserFundsAndGenerateTicket(total);
}


// Función para cargar los fondos del usuario y generar el ticket de compra
function loadUserFundsAndGenerateTicket(total = 0) {
    const userId = localStorage.getItem('userId');  // Obtener el ID del usuario desde localStorage

    if (!userId) {
        alert("No se pudo obtener el ID del usuario.");
        return;
    }

    // Obtener los fondos del usuario usando POST en lugar de GET
    fetch('https://panaderia-esperanza.onrender.com/usuario/fondos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })  // Enviar el userId en el cuerpo de la solicitud
    })
        .then(response => response.json())
        .then(usuario => {
            const fondosUsuario = parseFloat(usuario.fondos);  // Convertir fondos a número

            if (isNaN(fondosUsuario)) {
                alert('Error: Los fondos del usuario no son válidos.');
                return;
            }

            const totalCompra = window.productInfo.precio * window.productInfo.cantidad;  // Total de la compra

            const ticketHTML = `
                <div class="ticket-header">
                    <h5>Ticket de Compra</h5>
                    <p>Panadería La Desesperanza</p>
                </div>
                <div class="ticket-info">
                    <p><span>Fecha:</span> ${new Date().toLocaleString()}</p>
                    <p><span>Venta ID:</span> ${Math.floor(Math.random() * 10000)}</p>
                    <p><span>Producto:</span> ${window.productInfo.nombre} (Cantidad: ${window.productInfo.cantidad})</p>
                    <p><span>Total a Pagar:</span> $${totalCompra.toFixed(2)}</p>
                    <p><span>Fondos Disponibles:</span> $${fondosUsuario.toFixed(2)}</p>
                </div>
                <div class="ticket-footer">
                    <p>Gracias por su compra. ¡Vuelva pronto!</p>
                    ${fondosUsuario >= totalCompra ? 
                    `<button class="btn btn-primary" onclick="confirmPurchase('${Math.floor(Math.random() * 10000)}', ${totalCompra})">Confirmar Compra</button>` : 
                    `<p class="text-danger">No tienes suficientes fondos para completar la compra.</p>`}
                </div>
            `;
            document.getElementById('ticketInfo').innerHTML = ticketHTML;
        })
        .catch(error => {
            alert('Error al cargar los fondos: ' + error.message);
        });
}

// Función para confirmar la compra
function confirmPurchase(ventanum, total) {
    const productId = document.getElementById('buyProductId').value;
    const quantity = parseInt(document.getElementById('buyProductQuantity').value);
    const maxQuantity = parseInt(document.getElementById('buyProductQuantity').max);

    if (quantity <= 0 || quantity > maxQuantity) {
        alert('La cantidad debe ser mayor que 0 y no puede superar la cantidad disponible.');
        return;
    }

    // Asignar la cantidad seleccionada al producto
    window.productInfo.cantidad = quantity;

    // Verificar si el usuario tiene fondos suficientes
fetch('https://panaderia-esperanza.onrender.com/usuario/fondos', {
    method: 'POST',  // Cambié de GET a POST, para enviar datos en el cuerpo de la solicitud
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: localStorage.getItem('userId') })  // Enviar el userId correctamente
})
.then(response => response.json())
.then(usuario => {
    if (usuario.fondos <= 0) {
        alert('No tienes fondos suficientes para realizar compras. Por favor, agrega fondos primero.');
        return;
    }

    if (usuario.fondos < total) {
        alert('No tienes suficientes fondos para realizar esta compra.');
        return;
    }

    // Realizar la compra (enviar al backend para actualizar el inventario y fondos)
    fetch('https://panaderia-esperanza.onrender.com/usuario/confirmarCompra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: localStorage.getItem('userId'),
            productoId: productId,
            cantidad: window.productInfo.cantidad,
            ventaId: ventanum,
            total: total
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Compra realizada con éxito');
            window.location.reload(); // Recargar la página para actualizar el inventario
        } else {
            alert('Error al realizar la compra: ' + data.message);
        }
    })
    .catch(error => {
        alert('Error al realizar la compra: ' + error.message);
    });

});

}


document.getElementById('addFundsForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const amount = document.getElementById('addFundsAmount').value.trim();

    // Validación de la cantidad (solo números con hasta dos decimales)
    const amountValida = /^\d+(\.\d{1,2})?$/;  // Solo números con hasta dos decimales
    if (!amountValida.test(amount) || parseFloat(amount) <= 0 || parseFloat(amount) > 999999999999) {
        alert('Por favor ingresa una cantidad válida (solo números y hasta dos decimales).');
        return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Debes iniciar sesión primero.');
        window.location.href = 'index.html';
        return;
    }

    // Enviar la cantidad de fondos al backend
    fetch('https://panaderia-esperanza.onrender.com/usuario/agregarFondos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), userId })  // Incluye userId en el cuerpo de la solicitud
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al agregar fondos: ' + response.status);
        }
        alert('Fondos agregados correctamente');

        // Llamar a la función para recargar los detalles del usuario con el saldo actualizado
        loadUserDetails();

        // Vaciar el campo de texto del modal de fondos
        document.getElementById('addFundsAmount').value = '';

        // Cerrar el modal y eliminar el fondo gris
        const modal = document.getElementById('addFundsModal');
        const modalBackdrop = document.querySelector('.modal-backdrop');
        modal.classList.remove('show');
        modalBackdrop && modalBackdrop.remove();
    })
    .catch(error => {
        alert('Error: ' + error.message);
    });
});


document.addEventListener("DOMContentLoaded", () => {
    loadUserDetails();
    loadProducts();
});

// Función para cargar los detalles del usuario
function loadUserDetails() {
    const userId = localStorage.getItem('userId');

    if (!userId || isNaN(userId)) {
        alert("ID de usuario no válido. Debes iniciar sesión.");
        window.location.href = 'index.html';
        return;
    }

    // Obtener datos del usuario desde el backend
    fetch(`https://panaderia-esperanza.onrender.com/usuario/${userId}`)
    .then(response => {
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Usuario no encontrado.');
            }
            throw new Error(`Error al obtener los detalles del usuario: ${response.status}`);
        }
        return response.json();
    })
    .then(usuario => {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const fondos = parseFloat(usuario.fondos); // Convertir fondos a número

        if (isNaN(fondos)) {
            alert('Error: El saldo del usuario no es válido.');
            return;
        }

        welcomeMessage.textContent = `Bienvenido, ${usuario.nombre}. Tu saldo es: $${fondos.toFixed(2)}`; // Usar toFixed con el número
    })
    .catch(error => {
        console.error('Error al cargar los detalles del usuario:', error.message);
        alert(`No se pudo cargar la información del usuario: ${error.message}`);
    });
}