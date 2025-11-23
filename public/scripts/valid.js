document.addEventListener("DOMContentLoaded", () => {
    const registerBtn = document.getElementById("registerBtn");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const roleSelect = document.getElementById("role");

    const loginBtn = document.getElementById("loginBtn");
    const nameLoginInput = document.getElementById("nameLogin");
    const passwordLoginInput = document.getElementById("passwordLogin");

    // Expresiones regulares
    const nameRegex = /^[A-Za-z\s]+$/; // Solo letras y espacios
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Formato válido de correo

    // Validación del formulario de registro
    const validateRegisterForm = () => {
        let isValid = true;

        // Validación del nombre completo
        if (!nameRegex.test(nameInput.value)) {
            alert("El nombre solo debe contener letras y espacios.");
            isValid = false;
        }

        // Validación del correo electrónico
        if (!emailRegex.test(emailInput.value)) {
            alert("Por favor, ingresa un correo electrónico válido.");
            isValid = false;
        }

        // Validación de la contraseña
        const password = passwordInput.value;
        if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
            alert("La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula y un número.");
            isValid = false;
        }

        // Validación de la confirmación de la contraseña
        if (password !== confirmPasswordInput.value) {
            alert("Las contraseñas no coinciden.");
            isValid = false;
        }

        return isValid;
    };

    // Evento para el botón de registro
    registerBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Evita el envío del formulario por defecto
        if (validateRegisterForm()) {
            const user = {
                name: nameInput.value,
                email: emailInput.value,
                password: passwordInput.value,
                role: roleSelect.value
            };
    
            console.log(user); // Agrega esta línea para verificar los datos
    
            fetch('/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Respuesta no válida del servidor: " + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log("Datos recibidos:", data);
                if (data.success) {
                    alert("Registro exitoso.");
                    document.getElementById('registerForm').reset();
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error("Error capturado en catch:", error);
                alert("Error de conexión o de servidor.");
            });                     
        }
    });

    // Validación del formulario de inicio de sesión
    const validateLoginForm = () => {
        let isValid = true;

        // Validación del nombre de usuario (email)
        if (!emailRegex.test(nameLoginInput.value)) {
            alert("Por favor, ingresa un correo electrónico válido.");
            isValid = false;
        }

        // Validación de la contraseña
        if (!passwordLoginInput.value) {
            alert("La contraseña es requerida.");
            isValid = false;
        }

        return isValid;
    };

    // Evento para el botón de inicio de sesión
    loginBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Evita el envío del formulario por defecto
        
        if (validateLoginForm()) {
            const userCredentials = {
                email: nameLoginInput.value,
                password: passwordLoginInput.value,
            };
    
            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userCredentials)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Respuesta no válida del servidor: " + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    console.log(data.usuario.rol);  // Muestra el rol recibido desde el servidor
    
                    alert("Inicio de sesión exitoso.");
    
                    // Guardamos el ID del usuario en el localStorage
                    localStorage.setItem('userId', data.usuario.usuario_id); // Cambiado a usuario_id
    
                    // Verifica el rol del usuario y redirige según corresponda
                    if (data.usuario.rol === 'administrador') {
                        window.location.href = 'panaderia.html';  // Redirigir a la página de administración
                    } else {
                        window.location.href = 'panaderia_cliente.html';  // Redirigir a la página de cliente
                    }
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error("Error capturado en catch:", error);
                alert("Error de conexión o de servidor.");
            });
        }
    });
});
