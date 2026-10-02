/**
 * server.js - Servidor Backend integrado
 */
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 1. Configuración de la conexión a TU base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'CineProyecto_2026!', 
    database: 'cine_upn_db'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error de conexión a MySQL:', err);
        return;
    }
    console.log('🚀 ¡Conectado con éxito a la base de datos cine_upn_db!');
});

// =========================================================================
// RUTAS DE MÓDULO PROGRAMACIÓN
// =========================================================================
app.use(express.static(__dirname));
app.get('/api/peliculas', (req, res) => {
    db.query("SELECT idPelicula, titulo, duracion, genero FROM Pelicula", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/peliculas', (req, res) => {
    const { titulo, duracion, genero, sipnosis } = req.body;
    db.query("INSERT INTO Pelicula (titulo, duracion, genero, sipnosis, imagenPoster) VALUES (?, ?, ?, ?, NULL)", 
    [titulo, duracion, genero, sipnosis], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Película registrada', id: result.insertId });
    });
});

// C. ELIMINAR PELÍCULA
app.delete('/api/peliculas/:id', (req, res) => {
    const { id } = req.params;
    const query = "DELETE FROM Pelicula WHERE idPelicula = ?";
    
    db.query(query, [id], (err, result) => {
        if (err) {
            // Manejar error si la película ya está asignada a una función (Restricción de llave foránea)
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ error: "No se puede eliminar la película porque ya tiene funciones programadas en cartelera." });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Película retirada del catálogo correctamente.' });
    });
});

// =========================================================================
// MÓDULO DE TAQUILLA: PROGRAMACIÓN DE FUNCIONES
// =========================================================================

// A. OBTENER PELÍCULAS Y SALAS (Para los selects)
app.get('/api/datos-programacion', (req, res) => {
    db.query("SELECT idPelicula, titulo FROM Pelicula", (err, peliculas) => {
        if (err) return res.status(500).json({ error: err.message });
        
        db.query("SELECT idSala, tipoSala FROM Sala WHERE estado = 'Disponible'", (err, salas) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ peliculas, salas });
        });
    });
});

// B. REGISTRAR FUNCIÓN
app.post('/api/funciones', (req, res) => {
    const { idPelicula, idSala, fecha, horarioInicio, horarioFin, precioBase } = req.body;
    const query = `INSERT INTO Funcion (idPelicula, idSala, fecha, horarioInicio, horarioFin, precioBase, estado) 
                   VALUES (?, ?, ?, ?, ?, ?, 'Disponible')`;
    
    db.query(query, [idPelicula, idSala, fecha, horarioInicio, horarioFin, precioBase], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Función programada con éxito', idFuncion: result.insertId });
    });
});

// D. LISTAR FUNCIONES (Para la tabla)
app.get('/api/funciones', (req, res) => {
    const query = `
        SELECT f.idPelicula, p.titulo, f.idSala, f.fecha, f.horarioInicio, f.precioBase, f.estado 
        FROM Funcion f
        JOIN Pelicula p ON f.idPelicula = p.idPelicula
        ORDER BY f.fecha DESC`;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// =========================================================================
// MÓDULO DE ACCESO / LOGIN (ACTUALIZADO A TABLA ROL)
// =========================================================================
app.post('/api/login', (req, res) => {
    const { usuario, contrasenia, rol } = req.body;

    // IMPRIME EN LA CONSOLA DE NODE PARA VER QUÉ RECIBE EL SERVIDOR
    console.log("--> Datos recibidos en backend:", { usuario, contrasenia, rol });

    const query = `
        SELECT u.idUsuario, u.username, u.nombres, u.apellidos, r.nombreRol 
        FROM Usuario u
        JOIN Rol r ON u.idRol = r.idRol
        WHERE u.username = ? AND u.contrasenia = ? AND r.nombreRol = ? AND u.estado = TRUE
    `;
    
    db.query(query, [usuario, contrasenia, rol], (err, results) => {
        if (err) {
            console.error("Error SQL:", err);
            return res.status(500).json({ error: err.message });
        }
        
        if (results.length > 0) {
            res.json({ 
                success: true, 
                usuario: {
                    idUsuario: results[0].idUsuario,
                    username: results[0].username,
                    nombres: results[0].nombres,
                    apellidos: results[0].apellidos,
                    rol: results[0].nombreRol
                } 
            });
        } else {
            res.status(401).json({ success: false, message: "Datos no válidos. Usuario, contraseña o rol incorrectos." });
        }
    });
});
const bcrypt = require('bcryptjs');

// Registro de Cliente con validación segura de contraseña
app.post('/api/cliente/registro', async (req, res) => {
    
const { nombres, apellidoPaterno, apellidoMaterno, correo, dni, password } = req.body;

if (!nombres || !apellidoPaterno || !apellidoMaterno || !correo || !dni || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
}

    // Validar contraseña en el servidor
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            error: 'La contraseña es débil. Debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.' 
        });
    }

    try {
        const checkQuery = `SELECT id_cliente FROM cliente WHERE dni = ? OR correo = ?`;

        db.query(checkQuery, [dni, correo], async (err, results) => {
            if (err) {
                console.error('Error al consultar cliente:', err);
                return res.status(500).json({ error: 'Error interno en la base de datos.' });
            }

            if (results.length > 0) {
                return res.status(400).json({ 
                    error: 'El DNI o el correo electrónico ya se encuentran registrados.' 
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertQuery = `
                INSERT INTO cliente (nombre, correo, password_hash, dni) 
                VALUES (?, ?, ?, ?)
            `;

            db.query(insertQuery, [nombre, correo, hashedPassword, dni], (errInsert, result) => {
                if (errInsert) {
                    console.error('Error al insertar cliente:', errInsert);
                    return res.status(500).json({ error: 'Error al registrar la cuenta.' });
                }

                res.status(201).json({ 
                    success: true, 
                    message: '¡Cliente registrado con éxito!' 
                });
            });
        });

    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error al procesar la solicitud.' });
    }
});
// Endpoint de Login para Clientes
app.post('/api/cliente/login', (req, res) => {
    const { correo, password } = req.body;

    const query = `SELECT * FROM cliente WHERE correo = ?`;

    db.query(query, [correo], async (err, results) => {
        if (err) {
            console.error("Error SQL:", err);
            return res.status(500).json({ error: "Error en la base de datos." });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos." });
        }

        const cliente = results[0];
        const match = await bcrypt.compare(password, cliente.password_hash);

        if (!match) {
            return res.status(401).json({ error: "Correo o contraseña incorrectos." });
        }

        // Respuesta correcta esperada por el cliente
        res.json({
            success: true,
            cliente: {
                idCliente: cliente.id_cliente || cliente.idCliente,
                nombre: cliente.nombre,
                correo: cliente.correo,
                dni: cliente.dni
            }
        });
    });
});
// Obtener Cartelera con Funciones
app.get('/api/cartelera', (req, res) => {
    const query = `
        SELECT p.idPelicula, p.titulo, p.genero, p.duracion, p.imagenPoster,
               f.idFuncion, f.horario, f.idSala, f.precioBase
        FROM Pelicula p
        INNER JOIN Funcion f ON p.idPelicula = f.idPelicula
        WHERE f.estado = TRUE
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error al obtener cartelera:", err);
            return res.status(500).json({ error: "Error al cargar la cartelera." });
        }

        // Agrupar funciones por película
        const peliculasMap = {};

        results.forEach(row => {
            if (!peliculasMap[row.idPelicula]) {
                peliculasMap[row.idPelicula] = {
                    idPelicula: row.idPelicula,
                    titulo: row.titulo,
                    genero: row.genero,
                    duracion: row.duracion,
                    imagen: row.imagen,
                    funciones: []
                };
            }
            if (row.idFuncion) {
                peliculasMap[row.idPelicula].funciones.push({
                    idFuncion: row.idFuncion,
                    horario: row.horario,
                    numeroSala: row.numeroSala,
                    precio: row.precio
                });
            }
        });

        res.json(Object.values(peliculasMap));
    });
});
// =========================================================================
// MÓDULO DE GESTIÓN DE ROLES
// =========================================================================

// A. Obtener todos los roles activos
app.get('/api/roles', (req, res) => {
    const query = "SELECT idRol, nombreRol, descripcion FROM Rol WHERE estado = TRUE";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// B. Registrar un nuevo rol
app.post('/api/roles', (req, res) => {
    const { nombreRol, descripcion } = req.body;

    if (!nombreRol) {
        return res.status(400).json({ error: "El nombre del rol es obligatorio." });
    }

    const query = "INSERT INTO Rol (nombreRol, descripcion, estado) VALUES (?, ?, TRUE)";
    db.query(query, [nombreRol, descripcion], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: "El nombre del rol ya existe." });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ success: true, message: 'Rol registrado con éxito.', idRol: result.insertId });
    });
});
// =========================================================================
// MÓDULO DE LOGÍSTICA: REGISTRO DE INGRESOS (Con Órdenes de Compra)
// =========================================================================

// A. Obtener órdenes pendientes para el modal (CORREGIDO: Estado 'Solicitada' y ruta /almacen)
app.get('/api/almacen/ordenes/pendientes', (req, res) => {
    const query = `
        SELECT o.idOrdenCompra, o.fechaRegistro, o.estado, p.razonSocial 
        FROM Orden o 
        JOIN Proveedor p ON o.idProveedor = p.idProveedor 
        WHERE o.estado = 'Solicitada'`; // Cambiado de 'Pendiente' a 'Solicitada'
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// B. Obtener detalles de insumos de una orden específica (CORREGIDO: Mapeo de columnas y precioCompra)
app.get('/api/almacen/ordenes/:id/detalles', (req, res) => {
    const query = `
        SELECT do.idInsumo, i.nombre AS nombreInsumo, do.cantidadRequerida, do.precioCompra 
        FROM Detalle_Orden do
        JOIN Insumo i ON do.idInsumo = i.idInsumo
        WHERE do.idOrdenCompra = ?`;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// C. Registrar ingreso, actualizar stock y cambiar estado de orden (Transacción completa - CORREGIDO)
app.post('/api/almacen/ingresos', (req, res) => {
    const { idUsuario, idOrdenCompra, detalles } = req.body;
    const fechaRegistro = new Date().toISOString().slice(0, 10);

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.query("INSERT INTO Ingreso (idUsuario, fechaRegistro, estado) VALUES (?, ?, 'Completado')", [idUsuario || 1, fechaRegistro], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
            
            const idNotaIngreso = result.insertId;
            const queryDetalle = "INSERT INTO Detalle_Ingreso (idNotaIngreso, idInsumo, cantidadRecibida) VALUES ?";
            const valoresDetalle = detalles.map(d => [idNotaIngreso, d.idInsumo, d.cantidadRecibida]);

            db.query(queryDetalle, [valoresDetalle], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

                let completados = 0;
                detalles.forEach(d => {
                    db.query("UPDATE Insumo SET stockActual = stockActual + ? WHERE idInsumo = ?", [d.cantidadRecibida, d.idInsumo], (err) => {
                        if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
                        completados++;
                        if (completados === detalles.length) {
                            // Actualiza la orden a 'Recibido' (o 'Recibida') una vez ingresado todo
                            db.query("UPDATE Orden SET estado = 'Recibido' WHERE idOrdenCompra = ?", [idOrdenCompra], (err) => {
                                if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
                                db.commit((err) => {
                                    if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
                                    res.json({ message: 'Ingreso registrado con éxito', idNotaIngreso });
                                });
                            });
                        }
                    });
                });
            });
        });
    });
});

// =========================================================================
// MÓDULO DE LOGÍSTICA: GENERAR ÓRDENES DE COMPRA
// =========================================================================

// A. Obtener proveedores filtrados por RUC o Razón Social
app.get('/api/proveedores', (req, res) => {
    const { filtro } = req.query;
    let query = "SELECT idProveedor, ruc, razonSocial, direccion, estado FROM Proveedor";
    let params = [];

    if (filtro) {
        query += " WHERE razonSocial LIKE ? OR ruc LIKE ?";
        params = [`%${filtro}%`, `%${filtro}%`];
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// B. Obtener insumos con bajo stock (Alerta de criticidad)
app.get('/api/insumos/bajo-stock', (req, res) => {
    // Retorna insumos donde el stockActual es menor o igual al stockMinimo
    const query = "SELECT idInsumo, nombre, stockActual, stockMinimo, precioSugerido FROM Insumo WHERE stockActual <= stockMinimo";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// C. Registrar una Orden de Compra con su Detalle (Transacción)
app.post('/api/ordenes', (req, res) => {
    const { idProveedor, idUsuario, detalles } = req.body;
    const fechaRegistro = new Date().toISOString().slice(0, 10);

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: err.message });

        // 1. Insertar la Cabecera de la Orden
        const queryOrden = "INSERT INTO Orden (idProveedor, idUsuario, fechaRegistro, estado) VALUES (?, ?, ?, 'Pendiente')";
        db.query(queryOrden, [idProveedor, idUsuario || 1, fechaRegistro], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

            const idOrdenCompra = result.insertId;

            // 2. Insertar el Detalle de la Orden
            const queryDetalle = "INSERT INTO Detalle_Orden (idOrdenCompra, idInsumo, cantidadRequerida, precioCompra) VALUES ?";
            // Mapeamos los datos para la inserción masiva en MySQL
            const valoresDetalle = detalles.map(d => [idOrdenCompra, d.idInsumo, d.cantidad, d.precioCompra]);

            db.query(queryDetalle, [valoresDetalle], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: err.message }));

                // 3. Confirmar la transacción si todo salió bien
                db.commit((err) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
                    res.json({ success: true, message: 'Orden de compra registrada correctamente.', idOrdenCompra });
                });
            });
        });
    });
});

// =========================================================================
// MÓDULO DE CAJA: APERTURA (ADAPTADO A TU BASE DE DATOS)
// =========================================================================

// A. Verificar si el usuario ya cuenta con una sesión de caja activa
app.get('/api/cajas/activa/:idUsuario', (req, res) => {
    const { idUsuario } = req.params;
    const query = "SELECT idSesionCaja, numeroCajaFisica, montoApertura, estado FROM Caja WHERE idUsuario = ? AND estado = 'Abierta'";
    
    db.query(query, [idUsuario], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            res.json({ tieneCajaActiva: true, caja: results[0] });
        } else {
            res.json({ tieneCajaActiva: false });
        }
    });
});

// B. Registrar la apertura de una nueva sesión de caja
app.post('/api/cajas/apertura', (req, res) => {
    const { idUsuario, numeroCajaFisica, montoApertura } = req.body;
    
    // Obtener la fecha y hora en formato DATETIME compatible (YYYY-MM-DD HH:MM:SS)
    const fechaHorarioApertura = new Date().toISOString().slice(0, 19).replace('T', ' ');

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: err.message });

        // 1. Insertar el registro en la tabla Caja (incluyendo explícitamente todos los campos obligatorios)
        const queryCaja = `INSERT INTO Caja 
            (idUsuario, numeroCajaFisica, fechaHorarioApertura, fechaHorarioCierre, montoApertura, montoCierreSistema, montoCierreReal, estado) 
            VALUES (?, ?, ?, NULL, ?, NULL, NULL, 'Abierta')`;
        
        db.query(queryCaja, [idUsuario, numeroCajaFisica, fechaHorarioApertura, montoApertura], (errCaja, result) => {
            if (errCaja) {
                return db.rollback(() => {
                    console.error("Error al insertar en Caja:", errCaja.message);
                    res.status(500).json({ error: errCaja.message });
                });
            }
            
            const idSesionCaja = result.insertId;
            // Hora actual en formato HH:MM:SS para tu columna VARCHAR(10) de hora
            const horaActual = new Date().toTimeString().split(' ')[0]; 

            // 2. Insertar el movimiento inicial en Movimiento_de_caja (idVenta queda como NULL)
            const queryMovimiento = `INSERT INTO Movimiento_de_caja 
                (idSesionCaja, idVenta, tipoMovimiento, monto, hora) 
                VALUES (?, NULL, 'SALDO INICIAL APERTURA', ?, ?)`;

            db.query(queryMovimiento, [idSesionCaja, montoApertura, horaActual], (errMov) => {
                if (errMov) {
                    return db.rollback(() => {
                        console.error("Error al insertar en Movimiento_de_caja:", errMov.message);
                        res.status(500).json({ error: errMov.message });
                    });
                }
                
                // Confirmar transacción si ambos pasos fueron exitosos
                db.commit((errCommit) => {
                    if (errCommit) {
                        return db.rollback(() => res.status(500).json({ error: errCommit.message }));
                    }
                    res.json({ 
                        success: true, 
                        message: 'Sesión de caja aperturada correctamente.', 
                        idSesionCaja 
                    });
                });
            });
        });
    });
});

// =========================================================================
// MÓDULO DE VENTAS: REGISTRAR VENTA PRESENCIAL Y EMISIÓN DE TICKETS
// =========================================================================

// A. Obtener funciones activas mapeadas con el nombre de la película y capacidad de la sala
app.get('/api/ventas/funciones-activas', (req, res) => {
    const query = `
        SELECT f.idFuncion, p.titulo, f.idSala, f.fecha, f.horarioInicio, f.precioBase, s.capacidad 
        FROM Funcion f
        JOIN Pelicula p ON f.idPelicula = p.idPelicula
        JOIN Sala s ON f.idSala = s.idSala
        WHERE UPPER(f.estado) = 'DISPOLIBLE' OR UPPER(f.estado) = 'DISPONIBLE'
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error en funciones-activas:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// B. Obtener asientos ocupados de una función específica
app.get('/api/ventas/asientos-ocupados/:idFuncion', (req, res) => {
    const { idFuncion } = req.params;

    const query = `
        SELECT item_comprado
        FROM detalle_venta
        WHERE idFuncion = ?
          AND item_comprado LIKE 'Entrada - Butaca %'
    `;

    db.query(query, [idFuncion], (err, results) => {
        if (err) {
            console.error("Error obteniendo asientos ocupados:", err);
            return res.status(500).json({ error: err.message });
        }

        const ocupados = results.map(r =>
            r.item_comprado.replace('Entrada - Butaca ', '')
        );

        res.json(ocupados);
    });
});

// C. RUTA CORREGIDA: PROCESAR VENTA PRESENCIAL (Sincronizada con tu SQL Real)
app.post('/api/ventas/procesar', (req, res) => {
    const { idSesionCaja, idFuncion, dniCliente, subtotal, descuento, totalNeto, asientos } = req.body;

    if (!idFuncion || !asientos || asientos.length === 0) {
        return res.status(400).json({ error: 'Faltan datos obligatorios para la transacción.' });
    }

    const horaActual = new Date().toLocaleTimeString('es-PE', { hour12: false }).substring(0, 5);
    const fechaHoraActual = new Date();

    // Iniciamos transacción transaccional en MySQL
    db.beginTransaction((errTx) => {
        if (errTx) return res.status(500).json({ error: errTx.message });

        // 1. Buscamos si el cliente existe por su DNI para obtener su 'idCliente' numérico
        db.query("SELECT idCliente FROM Cliente WHERE dniCliente = ?", [dniCliente], (errCli, rows) => {
            if (errCli) return db.rollback(() => res.status(500).json({ error: errCli.message }));

            // Si el cliente no existe en la tabla, se pasa NULL (Venta como invitado)
            const idClienteReal = rows.length > 0 ? rows[0].idCliente : null;

            // 2. Insertar en la tabla 'Venta' mapeando tus campos reales
            const queryVenta = `INSERT INTO Venta (idCliente, fechaHora, cantidadBoletos, montoBruto, montoDescuento, montoTotalNeto, tipoVenta, estado) 
                                VALUES (?, ?, ?, ?, ?, ?, 'Taquilla', 'Completada')`;
            
            db.query(queryVenta, [idClienteReal, fechaHoraActual, asientos.length, subtotal, descuento, totalNeto], (errVenta, resVenta) => {
                if (errVenta) return db.rollback(() => res.status(500).json({ error: errVenta.message }));

                const idVenta = resVenta.insertId;

                // 3. Insertar el Movimiento Financiero en la Caja Activa
                const queryMov = `INSERT INTO Movimiento_de_caja (idSesionCaja, idVenta, tipoMovimiento, monto, hora) 
                                  VALUES (?, ?, 'INGRESO POR VENTA', ?, ?)`;

                db.query(queryMov, [idSesionCaja, idVenta, totalNeto, horaActual], (errMov) => {
                    if (errMov) return db.rollback(() => res.status(500).json({ error: errMov.message }));

                    // 4. Insertar los boletos seleccionados en 'detalle_venta' uno por uno
                    const queryDetalle = `INSERT INTO detalle_venta (idVenta, idFuncion, idAsiento, item_comprado, montoPagado, vuelto) VALUES ?`;
                    
                    // Como tus asientos en el Front son strings ('A1', 'B2') y en tu base de datos la tabla 'detalle_venta' 
                    // espera un ID numérico de asiento o un campo nulo, mandaremos temporalmente NULL en idAsiento 
                    // guardando el código de la butaca en 'item_comprado' para que no rompa las FK.
                    const valoresDetalle = asientos.map(butaca => [
                        idVenta, 
                        idFuncion, 
                        null, 
                        `Entrada - Butaca ${butaca}`, 
                        (totalNeto / asientos.length), 
                        0.00
                    ]);

                    db.query(queryDetalle, [valoresDetalle], (errDet) => {
                        if (errDet) return db.rollback(() => res.status(500).json({ error: errDet.message }));

                        // Confirmamos la transacción completa en la base de datos
                        db.commit((errCommit) => {
                            if (errCommit) return db.rollback(() => res.status(500).json({ error: errCommit.message }));
                            res.json({ success: true, message: 'Venta registrada con éxito en MySQL.', idVenta });
                        });
                    });
                });
            });
        });
    });
});

// =========================================================================
// MÓDULO: ARQUEO Y CIERRE DE CAJA (Objetivo Específico 3)
// =========================================================================

// 1. Obtener el estado transaccional actual de la caja para el resumen (Saldo esperado)
app.get('/api/cajas/resumen/:idSesionCaja', (req, res) => {
    const idSesionCaja = parseInt(req.params.idSesionCaja);

    // Consultamos el monto de apertura original de la sesión
    db.query("SELECT montoApertura, numeroCajaFisica FROM Caja WHERE idSesionCaja = ?", [idSesionCaja], (errCaja, rowsCaja) => {
        if (errCaja) return res.status(500).json({ error: errCaja.message });
        if (rowsCaja.length === 0) return res.status(404).json({ error: "No se encontró la sesión de caja." });

        const montoApertura = parseFloat(rowsCaja[0].montoApertura);
        const numeroCajaFisica = rowsCaja[0].numeroCajaFisica;

        // CONSULTA CORREGIDA: Filtramos estrictamente por el ID de sesión y que sea INGRESO POR VENTA
        const querySumaVentas = `SELECT COALESCE(SUM(monto), 0.00) AS totalVentas 
                                 FROM Movimiento_de_caja 
                                 WHERE idSesionCaja = ? AND tipoMovimiento = 'INGRESO POR VENTA'`;

        db.query(querySumaVentas, [idSesionCaja], (errMov, rowsMov) => {
            if (errMov) return res.status(500).json({ error: errMov.message });

            const totalVentas = parseFloat(rowsMov[0].totalVentas);
            const saldoEsperado = montoApertura + totalVentas;

            res.json({
                numeroCajaFisica,
                montoApertura: montoApertura,
                totalVentas: totalVentas,
                saldoEsperado: saldoEsperado
            });
        });
    });
});

// 2. Procesar el cierre de caja y registrar el arqueo / cuadre en MySQL
app.post('/api/cajas/cerrar', (req, res) => {
    const { idSesionCaja, montoCierreReal, saldoEsperado, observaciones } = req.body;

    if (!idSesionCaja || montoCierreReal === undefined) {
        return res.status(400).json({ error: "Faltan datos obligatorios para el arqueo." });
    }

    const fechaHorarioCierre = new Date();
    const diferencia = parseFloat(montoCierreReal) - parseFloat(saldoEsperado); // Positivo = Sobrante, Negativo = Faltante

    db.beginTransaction((errTx) => {
        if (errTx) return res.status(500).json({ error: errTx.message });

        // A. Actualizar los montos y el estado en la tabla 'Caja'
        const queryUpdateCaja = `UPDATE Caja 
                                 SET fechaHorarioCierre = ?, montoCierreSistema = ?, montoCierreReal = ?, estado = 'Cerrada' 
                                 WHERE idSesionCaja = ?`;

        db.query(queryUpdateCaja, [fechaHorarioCierre, saldoEsperado, montoCierreReal, idSesionCaja], (errUp, resultUp) => {
            if (errUp) return db.rollback(() => res.status(500).json({ error: errUp.message }));

            // B. Registrar la auditoría en la tabla 'Cuadre_de_caja'
            const queryCuadre = `INSERT INTO Cuadre_de_caja (idSesionCaja, diferencia, observaciones) 
                                 VALUES (?, ?, ?)`;

            db.query(queryCuadre, [idSesionCaja, diferencia, observaciones || 'Cierre de turno regular'], (errCuadre) => {
                if (errCuadre) return db.rollback(() => res.status(500).json({ error: errCuadre.message }));

                db.commit((errCommit) => {
                    if (errCommit) return db.rollback(() => res.status(500).json({ error: errCommit.message }));
                    res.json({ 
                        success: true, 
                        message: "Caja cerrada y auditada correctamente en MySQL.",
                        diferencia: diferencia
                    });
                });
            });
        });
    });
});

// =========================================================================
// AUDITORÍA: Consultar Movimientos desde la Base de Datos Real (CORREGIDO)
// =========================================================================
app.get('/api/auditoria/movimientos', (req, res) => {
    // Cruzamos Movimiento_de_caja con Caja usando las columnas exactas de tu script SQL
    const query = `
        SELECT 
            m.idMovimiento AS id,
            CONCAT('CAJA-0', c.numeroCajaFisica) AS caja,
            m.tipoMovimiento AS tipo,
            m.monto AS monto,
            m.hora AS hora
        FROM Movimiento_de_caja m
        JOIN Caja c ON m.idSesionCaja = c.idSesionCaja
        ORDER BY m.idMovimiento DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// =========================================================================
// MÓDULO: GESTIÓN DE ALMACÉN E INVENTARIOS (CORREGIDO SEGÚN TU SCRIPT SQL)
// =========================================================================

// 1. Endpoint para verificar stock crítico (Insumos donde stockActual <= stockMinimo)
app.get('/api/almacen/insumos/criticos', (req, res) => {
    const query = "SELECT idInsumo, nombre, stockActual, stockMinimo, precioSugerido FROM Insumo WHERE stockActual <= stockMinimo";
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. Endpoint para buscar proveedores por RUC o Razón Social (Para el Modal de Búsqueda)
app.get('/api/almacen/proveedores/buscar', (req, res) => {
    const criterio = req.query.criterio ? `%${req.query.criterio}%` : '%';
    const query = "SELECT idProveedor, ruc, razonSocial, estado FROM Proveedor WHERE estado = 'Activo' AND (ruc LIKE ? OR razonSocial LIKE ?)";
    db.query(query, [criterio, criterio], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 3. POST: Guardar la Orden de Compra (Cabecera y Detalle)
app.post('/api/almacen/ordenes', (req, res) => {
    const { idProveedor, idUsuario, detalles } = req.body; 

    if (!idProveedor || !detalles || detalles.length === 0) {
        return res.status(400).json({ error: "Datos incompletos para generar la orden." });
    }

    const fecha = new Date().toISOString().split('T')[0];
    const idUser = idUsuario || 1; 

    db.beginTransaction((errTx) => {
        if (errTx) return res.status(500).json({ error: errTx.message });

        const queryOrden = "INSERT INTO Orden (idProveedor, idUsuario, fechaRegistro, estado) VALUES (?, ?, ?, 'Solicitada')";
        db.query(queryOrden, [idProveedor, idUser, fecha], (errOrd, resultOrd) => {
            if (errOrd) return db.rollback(() => res.status(500).json({ error: errOrd.message }));

            const idOrdenCompra = resultOrd.insertId;
            const valoresDetalle = detalles.map(d => [idOrdenCompra, d.idInsumo, d.cantidad, d.precio]);

            const queryDetalle = "INSERT INTO Detalle_Orden (idOrdenCompra, idInsumo, cantidadRequerida, precioCompra) VALUES ?";
            db.query(queryDetalle, [valoresDetalle], (errDet) => {
                if (errDet) return db.rollback(() => res.status(500).json({ error: errDet.message }));

                db.commit((errCommit) => {
                    if (errCommit) return db.rollback(() => res.status(500).json({ error: errCommit.message }));
                    res.json({ success: true, idOrdenCompra });
                });
            });
        });
    });
});

// 4. GET: Buscar Orden Pendiente para registrar-ingreso.html
app.get('/api/almacen/ordenes-pendientes', (req, res) => {
    const query = `
        SELECT o.idOrdenCompra, o.fechaGrid, o.fechaRegistro, p.razonSocial AS proveedor, o.estado 
        FROM Orden o 
        JOIN Proveedor p ON o.idProveedor = p.idProveedor 
        WHERE o.estado = 'Solicitada'
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 5. GET: Detalles de una Orden específica
app.get('/api/almacen/ordenes/:id', (req, res) => {
    const query = `
        SELECT do.idInsumo, i.nombre AS insumo, do.cantidadRequerida AS cantidad, do.precioCompra AS precio, p.razonSocial AS proveedor
        FROM Detalle_Orden do
        JOIN Insumo i ON do.idInsumo = i.idInsumo
        JOIN Orden o ON do.idOrdenCompra = o.idOrdenCompra
        JOIN Proveedor p ON o.idProveedor = p.idProveedor
        WHERE do.idOrdenCompra = ?
    `;
    db.query(query, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 6. POST: Registrar el Ingreso (Usa 'Ingreso' y 'Detalle_Ingreso' exactos de tu script)
app.post('/api/almacen/ingresos', (req, res) => {
    const { idOrdenCompra, idUsuario, detalles } = req.body; 

    if (!idOrdenCompra || !detalles || detalles.length === 0) {
        return res.status(400).json({ error: "Datos insuficientes." });
    }

    const fecha = new Date().toISOString().split('T')[0];
    const idUser = idUsuario || 1;

    db.beginTransaction((errTx) => {
        if (errTx) return res.status(500).json({ error: errTx.message });

        const queryIngreso = "INSERT INTO Ingreso (idUsuario, fechaRegistro, estado) VALUES (?, ?, 'Recibida')";
        db.query(queryIngreso, [idUser, fecha], (errIng, resultIng) => {
            if (errIng) return db.rollback(() => res.status(500).json({ error: errIng.message }));

            const idNotaIngreso = resultIng.insertId;
            const valoresDetalle = detalles.map(d => [idNotaIngreso, d.idInsumo, d.cantidadRecibida]);

            const queryDetalle = "INSERT INTO Detalle_Ingreso (idNotaIngreso, idInsumo, cantidadRecibida) VALUES ?";
            db.query(queryDetalle, [valoresDetalle], (errDet) => {
                if (errDet) return db.rollback(() => res.status(500).json({ error: errDet.message }));

                db.query("UPDATE Orden SET estado = 'Recibida' WHERE idOrdenCompra = ?", [idOrdenCompra], (errOrdUp) => {
                    if (errOrdUp) return db.rollback(() => res.status(500).json({ error: errOrdUp.message }));

                    let promesas = detalles.map(d => {
                        return new Promise((resolve, reject) => {
                            db.query("UPDATE Insumo SET stockActual = stockActual + ? WHERE idInsumo = ?", [d.cantidadRecibida, d.idInsumo], (errStk) => {
                                if (errStk) reject(errStk);
                                else resolve();
                            });
                        });
                    });

                    Promise.all(promesas)
                        .then(() => {
                            db.commit((errCommit) => {
                                if (errCommit) return db.rollback(() => res.status(500).json({ error: errCommit.message }));
                                res.json({ success: true, idNotaIngreso });
                            });
                        })
                        .catch(errStk => db.rollback(() => res.status(500).json({ error: errStk.message })));
                });
            });
        });
    });
});

// GET: Obtener todos los insumos de la base de datos para el Kardex/Vista de Almacén
app.get('/api/almacen/insumos', (req, res) => {
    db.query("SELECT idInsumo, nombre, stockActual, stockMinimo, precioSugerido FROM Insumo", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Página principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});