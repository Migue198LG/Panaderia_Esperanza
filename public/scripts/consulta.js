// Función para cargar clientes y mostrarlos en la tabla
function loadClients() {
    fetch('http://localhost:3000/clientes')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos: ' + response.status);
            }
            return response.json();
        })
        .then(clientes => {
            const tbody = document.getElementById('clientTableBody');
            tbody.innerHTML = ''; // Limpiar la tabla

            // Agregar datos a la tabla
            clientes.forEach(cliente => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${cliente.usuario_nombre}</td>  <!-- Nombre del usuario -->
                    <td>${cliente.usuario_email}</td>   <!-- Correo del usuario -->
                    <td>${cliente.producto_nombre}</td> <!-- Nombre del producto -->
                    <td>${cliente.cantidad_comprada}</td> <!-- Cantidad comprada -->
                    <td>${cliente.numero_venta}</td>   <!-- Número de venta -->
                    <td>$${cliente.total_a_pagar}</td>  <!-- Total a pagar -->
                    <td>${new Date(cliente.fecha_compra).toLocaleString()}</td> <!-- Fecha y hora de compra -->
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

// Llamar a la función para cargar los datos cuando se carga la página
window.onload = loadClients;
