    // logout.js

// Obtener el botón de cerrar sesión
const logoutBtn = document.getElementById("logoutBtn");

// Agregar un evento de clic al botón
logoutBtn.addEventListener("click", function() {
    // Eliminar el token o la información de sesión guardada
    // Aquí, el método puede cambiar dependiendo de cómo almacenes la sesión (localStorage, sessionStorage, cookies, etc.)
    localStorage.removeItem("userToken"); // Ejemplo usando localStorage, ajusta según tu implementación
    sessionStorage.removeItem("userToken"); // Si usas sessionStorage, puedes limpiar también esta opción

    // Redirigir al usuario a la página de inicio de sesión o página principal
    window.location.href = "index.html"; // Ajusta a la URL de tu página de inicio de sesión
});
