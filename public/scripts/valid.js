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
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validación del formulario de registro
    const validateRegisterForm = () => {
        let isValid = true;

        if (!nameRegex.test(nameInput.value)) {
            alert("El nombre solo debe contener letras y espacios.");
            isValid = false;
        }

        if (!emailRegex.test(emailInput.value)) {
            alert("Por favor, ingresa un correo electrónico válido.");
            isValid = false;
        }

        const password = passwordInput.value;
        if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
            alert("La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula y un número.");
            isValid = false;
        }

        if (password !== confirmPasswordInput.value) {
            alert("Las contraseñas no coinciden.");
            isValid = false;
        }

        return isValid;
    };

    // Evento para el botón de registro - CON MÚLTIPLES OPCIONES
    registerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (validateRegisterForm()) {
            const user = {
                name: nameInput.value,
                email: emailInput.value,
                password: passwordInput.value,
                role: roleSelect.value
            };
    
            console.log("Datos de registro:", user);
    
            // Lista de posibles endpoints a probar
            const possibleEndpoints = [
                'https://panaderia-esperanza.onrender.com/registro',
                'https://panaderia-esperanza.onrender.com/auth/registro',
                'https://panaderia-esperanza.onrender.com/api/registro',
                'https://panaderia-esperanza.onrender.com/signup',
                'https://panaderia-esperanza.onrender.com/auth/signup',
                'https://panaderia-esperanza.onrender.com/api/signup'
            ];
    
            // Función para intentar registro en diferentes endpoints
            const tryRegister = async (endpoints) => {
                for (const endpoint of endpoints) {
                    try {
                        console.log(`Intentando registrar en: ${endpoint}`);
                        const response = await fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(user)
                        });
    
                        console.log(`Respuesta de ${endpoint}:`, response.status);
    
                        if (response.ok) {
                            const data = await response.json();
                            console.log("Registro exitoso:", data);
                            alert("Registro exitoso.");
                            document.getElementById('registerForm').reset();
                            return true;
                        }
                    } catch (error) {
                        console.log(`Error en ${endpoint}:`, error.message);
                    }
                }
                return false;
            };
    
            tryRegister(possibleEndpoints).then(success => {
                if (!success) {
                    alert("No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.");
                }
            });                    
        }
    });

    // Validación del formulario de inicio de sesión
    const validateLoginForm = () => {
        let isValid = true;

        if (!emailRegex.test(nameLoginInput.value)) {
            alert("Por favor, ingresa un correo electrónico válido.");
            isValid = false;
        }

        if (!passwordLoginInput.value) {
            alert("La contraseña es requerida.");
            isValid = false;
        }

        return isValid;
    };

    // Evento para el botón de inicio de sesión - CON MÚLTIPLES OPCIONES
    loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        
        if (validateLoginForm()) {
            const userCredentials = {
                email: nameLoginInput.value,
                password: passwordLoginInput.value,
            };
    
            // Lista de posibles endpoints a probar
            const possibleEndpoints = [
                'https://panaderia-esperanza.onrender.com/login',
                'https://panaderia-esperanza.onrender.com/auth/login',
                'https://panaderia-esperanza.onrender.com/api/login',
                'https://panaderia-esperanza.onrender.com/signin',
                'https://panaderia-esperanza.onrender.com/auth/signin'
            ];
    
            // Función para intentar login en diferentes endpoints
            const tryLogin = async (endpoints) => {
                for (const endpoint of endpoints) {
                    try {
                        console.log(`Intentando login en: ${endpoint}`);
                        const response = await fetch(endpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(userCredentials)
                        });
    
                        console.log(`Respuesta de ${endpoint}:`, response.status);
    
                        if (response.ok) {
                            const data = await response.json();
                            console.log("Login exitoso:", data);
                            
                            if (data.success) {
                                alert("Inicio de sesión exitoso.");
                                localStorage.setItem('userId', data.usuario.usuario_id);
    
                                if (data.usuario.rol === 'administrador') {
                                    window.location.href = 'panaderia.html';
                                } else {
                                    window.location.href = 'panaderia_cliente.html';
                                }
                                return true;
                            } else {
                                alert(data.message || "Credenciales incorrectas");
                                return true; // El endpoint funciona pero las credenciales son incorrectas
                            }
                        }
                    } catch (error) {
                        console.log(`Error en ${endpoint}:`, error.message);
                    }
                }
                return false;
            };
    
            tryLogin(possibleEndpoints).then(success => {
                if (!success) {
                    alert("No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.");
                }
            });
        }
    });
});
