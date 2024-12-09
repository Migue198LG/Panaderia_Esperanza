-- Crear la base de datos
CREATE DATABASE PanaderiaLaDesesperanza;
USE PanaderiaLaDesesperanza;

-- Tabla Productos
CREATE TABLE Productos (
    producto_id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('Navidad', 'Noche Buena') NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imagen_url VARCHAR(300),
    UNIQUE(nombre)
);

SELECT * FROM Productos;

-- Tabla Inventario
CREATE TABLE Inventario (
    inventario_id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad >= 0),
    FOREIGN KEY (producto_id) REFERENCES Productos(producto_id) ON DELETE CASCADE
);

SELECT * FROM Inventario;

-- Tabla Usuarios
CREATE TABLE Usuarios (
    usuario_id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    fondos DECIMAL(10, 2) DEFAULT 0.00,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Compras con numero_venta como número
CREATE TABLE Compras (
    compra_id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    numero_venta INT NOT NULL UNIQUE,  -- Columna numérica para el número de venta
    total_a_pagar DECIMAL(10, 2) NOT NULL,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(usuario_id) ON DELETE CASCADE
);


-- Tabla DetallesCompra (productos comprados por cada compra)
CREATE TABLE DetallesCompra (
    detalle_id INT PRIMARY KEY AUTO_INCREMENT,
    compra_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL, -- Total por ese producto (precio_unitario * cantidad)
    FOREIGN KEY (compra_id) REFERENCES Compras(compra_id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES Productos(producto_id)
);

-- Tabla Ticket
CREATE TABLE Ticket (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    compra_id INT NOT NULL,
    numero_venta VARCHAR(20) NOT NULL,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (compra_id) REFERENCES Compras(compra_id)
);
