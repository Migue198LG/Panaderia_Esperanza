require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const path = require("path");
const cors = require('cors');

const app = express();
app.use(cors());

// Configuración de la conexión a la base de datos
const con = mysql.createConnection({
    host: process.env.DB_HOST, 
    user: process.env.DB_USERNAME, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
});

// Conectar a la base de datos y manejar errores de conexión
con.connect((err) => {
    if (err) {
        console.error("Error al conectar a la base de datos:", err);
    } else {
        console.log("Conexión exitosa a la base de datos");
    }
});

// Configuración de middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Carpeta para archivos front-end (HTML, CSS, JS)

// Ruta para servir el index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Validación de nombre (solo letras)
const validarNombre = (nombre) => /^[a-zA-Z\s]+$/.test(nombre);

// Validación de contraseña (mínimo 8 caracteres, al menos 1 número, 1 mayúscula)
const validarContraseña = (contraseña) => /^(?=.*\d)(?=.*[A-Z]).{8,}$/.test(contraseña);

app.post("/registro", (req, res) => {
    console.log("Datos recibidos en el body:", req.body); // Log para verificar los datos

    const { name, email, password, role } = req.body;

    console.log("Nombre:", name);
    console.log("Email:", email);
    console.log("Contraseña:", password);
    console.log("Rol:", role);

    // Verificar que no haya valores vacíos o nulos
    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: "Por favor, completa todos los campos." });
    }

    // Validación de nombre (solo letras)
    if (!validarNombre(name)) {
        return res.status(400).json({ success: false, message: "El nombre solo puede contener letras." });
    }

    // Validación de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Por favor, ingresa un correo electrónico válido." });
    }

    // Validación de contraseña (mínimo 8 caracteres, 1 mayúscula, 1 número)
    if (!validarContraseña(password)) {
        return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número." });
    }

    // Verificar si el email ya está registrado
    con.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, resultados) => {
        if (err) {
            console.error("Error al verificar el email:", err);
            return res.status(500).json({ success: false, message: "Error al verificar el email." });
        }

        if (resultados.length > 0) {
            return res.status(400).json({ success: false, message: "El email ya está registrado." });
        }

        // Hash de la contraseña
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error("Error al cifrar la contraseña:", err);
                return res.status(500).json({ success: false, message: "Error al cifrar la contraseña." });
            }

            // Insertar el nuevo usuario en la base de datos con rol por defecto o especificado
            const query = "INSERT INTO usuarios (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)";
            con.query(query, [name, email, hash, role], (err, result) => {
                if (err) {
                    console.error("Error al registrar el usuario:", err);
                    return res.status(500).json({ success: false, message: "Error al registrar el usuario." });
                }

                res.json({ success: true, message: "Usuario registrado correctamente." });
            });
        });
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Por favor, ingresa tu correo y contraseña." });
    }

    con.query("SELECT * FROM usuarios WHERE email = ?", [email], (err, resultados) => {
        if (err) {
            console.error("Error al verificar el email:", err);
            return res.status(500).json({ success: false, message: "Error al verificar el email." });
        }

        if (resultados.length === 0) {
            return res.status(400).json({ success: false, message: "Correo electrónico o contraseña incorrectos." });
        }

        const usuario = resultados[0];

        // Comparar la contraseña ingresada con la almacenada (cifrada)
        bcrypt.compare(password, usuario.contraseña, (err, esValido) => {
            if (err) {
                console.error("Error al comparar contraseñas:", err);
                return res.status(500).json({ success: false, message: "Error al verificar la contraseña." });
            }

            if (!esValido) {
                return res.status(400).json({ success: false, message: "Correo electrónico o contraseña incorrectos." });
            }

            // Si la contraseña es válida, devolver los datos del usuario
            res.json({
                success: true,
                message: "Inicio de sesión exitoso.",
                usuario: {
                    usuario_id: usuario.usuario_id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                    rol: usuario.rol,  // Agregar rol aquí
                },
            });
        });
    });
});

// Obtener detalles del usuario
app.get('/usuario/:id', (req, res) => {
    const userId = req.params.id;

    // Asegurarnos de que el userId sea un número válido
    if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID de usuario no válido' });
    }

    con.query('SELECT * FROM usuarios WHERE usuario_id = ?', [userId], (error, results) => {
        if (error) {
            console.error(`Error al obtener usuario con ID ${userId}:`, error.message);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        if (results.length === 0) {
            console.warn(`Usuario con ID ${userId} no encontrado`);
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        console.log(results[0]);

        // Enviar la información del usuario al cliente
        res.json(results[0]);
    });
});


// Rutas de productos

// Crear un nuevo producto con verificación de duplicados
app.post("/agregarProducto", (req, res) => {
    const { nombre, tipo, precio, cantidad, imagen_url } = req.body;

    if (!nombre || !tipo || !precio || precio <= 0 || !cantidad || cantidad < 0) {
        return res.status(400).send("Datos de producto inválidos o incompletos.");
    }

    // Verificar si ya existe un producto con el mismo nombre
    con.query("SELECT * FROM productos WHERE nombre = ?", [nombre], (err, resultados) => {
        if (err) {
            console.error("Error al verificar producto existente:", err);
            return res.status(500).send("Error al verificar producto.");
        }

        if (resultados.length > 0) {
            // Si ya existe un producto con el mismo nombre, retornar un mensaje de error
            return res.status(400).send("Ya existe un producto con este nombre.");
        }

        // Insertar producto si no existe duplicado
        con.query(
            "INSERT INTO productos (nombre, tipo, precio, imagen_url) VALUES (?, ?, ?, ?)",
            [nombre, tipo, precio, imagen_url],
            (err, resultado) => {
                if (err) {
                    console.error("Error al agregar producto:", err);
                    return res.status(500).send("Error al agregar producto.");
                }

                con.query(
                    "INSERT INTO inventario (producto_id, cantidad) VALUES (?, ?)",
                    [resultado.insertId, cantidad],
                    (err) => {
                        if (err) {
                            console.error("Error al agregar inventario:", err);
                            return res.status(500).send("Error al agregar inventario.");
                        }
                        return res.send("Producto agregado correctamente");
                    }
                );
            }
        );
    });
});

// Obtener todos los productos
app.get("/productos", (req, res) => {
    const query = `
    SELECT productos.producto_id, productos.nombre, productos.tipo, productos.precio, productos.imagen_url, inventario.cantidad
    FROM productos
    JOIN inventario ON productos.producto_id = inventario.producto_id
`;

    con.query(query, (err, productos) => {
        if (err) {
            console.error("Error al obtener productos:", err);
            return res.status(500).send("Error al obtener productos.");
        }
        res.json(productos);
    });
});

// Obtener un producto específico por su ID
app.get("/productos/:id", (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT productos.producto_id, productos.nombre, productos.tipo, productos.precio, inventario.cantidad
        FROM productos
        JOIN inventario ON productos.producto_id = inventario.producto_id
        WHERE productos.producto_id = ?
    `;

    con.query(query, [id], (err, producto) => {
        if (err) {
            console.error("Error al obtener el producto:", err);
            return res.status(500).send("Error al obtener el producto.");
        }

        if (producto.length === 0) {
            return res.status(404).send("Producto no encontrado.");
        }

        res.json(producto[0]);
    });
});

// Actualizar un producto
app.put("/editarProducto/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, tipo, precio, cantidad } = req.body;

    if (!nombre || !tipo || !precio || precio <= 0 || !cantidad || cantidad < 0) {
        return res.status(400).send("Datos de producto inválidos o incompletos.");
    }

    con.query(
        "UPDATE productos SET nombre = ?, tipo = ?, precio = ? WHERE producto_id = ?",
        [nombre, tipo, precio, id],
        (err) => {
            if (err) {
                console.error("Error al editar producto:", err);
                return res.status(500).send("Error al editar producto.");
            }

            con.query(
                "UPDATE inventario SET cantidad = ? WHERE producto_id = ?",
                [cantidad, id],
                (err) => {
                    if (err) {
                        console.error("Error al actualizar inventario:", err);
                        return res.status(500).send("Error al actualizar inventario.");
                    }
                    return res.send("Producto actualizado correctamente");
                }
            );
        }
    );
});

// Eliminar un producto
app.delete("/eliminarProducto/:id", (req, res) => {
    const { id } = req.params;

    // Primero, verificamos si el producto está vinculado a alguna compra
    con.query("SELECT * FROM detallescompra WHERE producto_id = ?", [id], (err, results) => {
        if (err) {
            console.error("Error al verificar si el producto está vinculado a alguna compra:", err);
            return res.status(500).send("Error al verificar el producto en DetallesCompra.");
        }

        // Si el producto está vinculado a alguna compra, solo eliminamos del inventario
        if (results.length > 0) {
            con.query("DELETE FROM inventario WHERE producto_id = ?", [id], (err) => {
                if (err) {
                    console.error("Error al eliminar inventario:", err);
                    return res.status(500).send("Error al eliminar inventario.");
                }
                return res.send("Producto eliminado del inventario, pero aún vinculado a compras.");
            });
        } else {
            // Si no está vinculado, eliminamos tanto del inventario como de productos
            con.query("DELETE FROM inventario WHERE producto_id = ?", [id], (err) => {
                if (err) {
                    console.error("Error al eliminar inventario:", err);
                    return res.status(500).send("Error al eliminar inventario.");
                }

                con.query("DELETE FROM productos WHERE producto_id = ?", [id], (err) => {
                    if (err) {
                        console.error("Error al eliminar producto:", err);
                        return res.status(500).send("Error al eliminar producto.");
                    }
                    return res.send("Producto eliminado del inventario y de productos.");
                });
            });
        }
    });
});


// Obtener los fondos de un usuario
app.post('/usuario/fondos', (req, res) => {
    const { userId } = req.body;  // Obtener el userId desde el cuerpo de la solicitud

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ success: false, message: 'ID de usuario no válido' });
    }

    // Consulta para obtener los fondos del usuario
    con.query('SELECT fondos FROM usuarios WHERE usuario_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener los fondos:', err);
            return res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const fondos = parseFloat(results[0].fondos) || 0;  // Asegurarse de que los fondos sean un número
        res.json({ success: true, fondos });
    });
});




// Agregar fondos al usuario
app.post('/usuario/agregarFondos', (req, res) => {
    const { amount, userId } = req.body;

    // Validaciones de entrada
    if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Usuario o cantidad inválidos' });
    }

    con.query(
        'UPDATE usuarios SET fondos = fondos + ? WHERE usuario_id = ?',
        [amount, userId],
        (err, result) => {
            if (err) {
                console.error("Error al agregar fondos:", err);
                return res.status(500).json({ success: false, message: 'Error al agregar fondos' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            res.json({ success: true, message: 'Fondos agregados correctamente' });
        }
    );
});

// Confirmar la compra de un producto
app.post('/usuario/confirmarCompra', (req, res) => {
    const { userId, productoId, cantidad, ventaId, total } = req.body;

    // Validar los parámetros
    if (!userId || !productoId || !cantidad || !ventaId || !total) {
        return res.status(400).json({ success: false, message: 'Datos de compra inválidos' });
    }

    // Iniciar transacción para manejar correctamente los cambios en varias tablas
    con.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error al iniciar la transacción' });
        }

        // 1. Verificar fondos del usuario
        con.query('SELECT fondos FROM usuarios WHERE usuario_id = ?', [userId], (err, results) => {
            if (err) {
                return con.rollback(() => {
                    res.status(500).json({ success: false, message: 'Error al verificar los fondos' });
                });
            }

            if (results.length === 0 || results[0].fondos < total) {
                return con.rollback(() => {
                    res.status(400).json({ success: false, message: 'Fondos insuficientes' });
                });
            }

            const fondosRestantes = results[0].fondos - total;

            // 2. Actualizar los fondos del usuario
            con.query('UPDATE usuarios SET fondos = ? WHERE usuario_id = ?', [fondosRestantes, userId], (err) => {
                if (err) {
                    return con.rollback(() => {
                        res.status(500).json({ success: false, message: 'Error al actualizar los fondos' });
                    });
                }

                // 3. Verificar cantidad disponible en inventario
                con.query('SELECT cantidad FROM inventario WHERE producto_id = ?', [productoId], (err, inventario) => {
                    if (err) {
                        return con.rollback(() => {
                            res.status(500).json({ success: false, message: 'Error al verificar inventario' });
                        });
                    }

                    if (inventario.length === 0 || inventario[0].cantidad < cantidad) {
                        return con.rollback(() => {
                            res.status(400).json({ success: false, message: 'Cantidad de producto no disponible en inventario' });
                        });
                    }

                    const nuevaCantidad = inventario[0].cantidad - cantidad;

                    // 4. Actualizar inventario
                    con.query('UPDATE inventario SET cantidad = ? WHERE producto_id = ?', [nuevaCantidad, productoId], (err) => {
                        if (err) {
                            return con.rollback(() => {
                                res.status(500).json({ success: false, message: 'Error al actualizar inventario' });
                            });
                        }

                        // 5. Registrar la compra en la tabla Compras
                        con.query('INSERT INTO compras (usuario_id, numero_venta, total_a_pagar) VALUES (?, ?, ?)', [userId, ventaId, total], (err, resultCompra) => {
                            if (err) {
                                return con.rollback(() => {
                                    res.status(500).json({ success: false, message: 'Error al registrar la compra' });
                                });
                            }

                            const compraId = resultCompra.insertId;

                            // 6. Registrar los detalles de la compra (productos comprados)
                            con.query('INSERT INTO detallescompra (compra_id, producto_id, cantidad, precio_unitario, total) VALUES (?, ?, ?, ?, ?)', [compraId, productoId, cantidad, total / cantidad, total], (err) => {
                                if (err) {
                                    return con.rollback(() => {
                                        res.status(500).json({ success: false, message: 'Error al registrar los detalles de la compra' });
                                    });
                                }

                                // 7. Finalizar la transacción
                                con.commit((err) => {
                                    if (err) {
                                        return con.rollback(() => {
                                            res.status(500).json({ success: false, message: 'Error al finalizar la transacción' });
                                        });
                                    }

                                    res.json({ success: true, message: 'Compra realizada con éxito' });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get('/clientes', (req, res) => {
    const query = `
      SELECT 
    u.nombre AS usuario_nombre,
    u.email AS usuario_email,
    p.nombre AS producto_nombre,
    dc.cantidad AS cantidad_comprada,
    c.numero_venta,
    c.total_a_pagar,
    c.fecha_compra
    FROM 
        compras c
    JOIN 
        usuarios u ON c.usuario_id = u.usuario_id
    JOIN 
        detallescompra dc ON c.compra_id = dc.compra_id
    JOIN 
        productos p ON dc.producto_id = p.producto_id
    ORDER BY 
        c.fecha_compra DESC;
    `;
  
    con.query(query, (err, results) => {
      if (err) {
        console.error('Error ejecutando el query:', err.stack);
        return res.status(500).json({ error: 'Error en la base de datos', message: err.message });
      }
      res.json(results);
    });
  });
  

// Arrancar el servidor
app.listen(3000, () => {
    console.log("Servidor ejecutándose en http://localhost:3000");
});
    