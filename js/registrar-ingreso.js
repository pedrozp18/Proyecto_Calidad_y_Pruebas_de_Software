/**
 * js/registrar-ingreso.js
 * Lógica reconstruida desde cero para el control estricto de Notas de Ingreso (MySQL)
 */

document.addEventListener("DOMContentLoaded", () => {
    // Generar automáticamente la fecha del sistema en formato legible
    const txtFecha = document.getElementById("ingreso-fecha");
    if (txtFecha) {
        const hoy = new Date();
        const dd = String(hoy.getDate()).padStart(2, '0');
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const yyyy = hoy.getFullYear();
        txtFecha.value = `${dd}/${mm}/${yyyy}`;
    }

    const usuarioSesion = JSON.parse(localStorage.getItem("usuario_sesion")) || { idUsuario: 1 };
    
    let ordenSeleccionadaId = null;
    let insumosDeLaOrden = [];

    // Componentes DOM capturados de manera limpia
    const btnBuscarOrden = document.getElementById("btn-buscar-orden");
    const modalOrdenes = document.getElementById("modal-ordenes");
    const btnCloseModalO = document.getElementById("btn-close-modal-o");
    const tbodyModalOrdenes = document.getElementById("tbody-modal-ordenes");
    const tbodyIngresoDetalle = document.getElementById("tbody-ingreso-detalle");
    const formIngreso = document.getElementById("form-ingreso");
    const btnSalirIngreso = document.getElementById("btn-salir-ingreso");

    // ==========================================
    // 1. CARGAR ÓRDENES GENERADAS / PENDIENTES
    // ==========================================
    btnBuscarOrden.addEventListener("click", () => {
        modalOrdenes.classList.remove("hidden");
        tbodyModalOrdenes.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b;">Consultando órdenes activas...</td></tr>`;

        fetch('http://localhost:3000/api/almacen/ordenes/pendientes')
            .then(res => res.json())
            .then(ordenes => {
                tbodyModalOrdenes.innerHTML = "";

                if (ordenes.length === 0) {
                    tbodyModalOrdenes.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #f87171;">No existen órdenes de compra pendientes de recibir.</td></tr>`;
                    return;
                }

                let htmlOrdenes = "";
                ordenes.forEach(o => {
                    htmlOrdenes += `
                        <tr>
                            <td><strong>OC-${o.idOrdenCompra}</strong></td>
                            <td>${o.fechaRegistro}</td>
                            <td>${o.razonSocial}</td>
                            <td><span class="badge badge-warning">${o.estado}</span></td>
                            <td style="text-align: center;">
                                <button type="button" class="btn btn-success" style="padding: 5px 12px; font-size: 0.85rem;"
                                    onclick="cargarDetalleOrdenEspecifica('${o.idOrdenCompra}')">
                                    Seleccionar
                                </button>
                            </td>
                        </tr>
                    `;
                });
                tbodyModalOrdenes.innerHTML = htmlOrdenes;
            })
            .catch(err => {
                console.error(err);
                tbodyModalOrdenes.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #f87171;">Error al conectar con el servidor.</td></tr>`;
            });
    });

    if (btnCloseModalO) {
        btnCloseModalO.addEventListener("click", () => modalOrdenes.classList.add("hidden"));
    }

    // ==========================================
    // 2. CARGAR INSUMOS DE LA ORDEN SELECCIONADA
    // ==========================================
    window.cargarDetalleOrdenEspecifica = function(idOrden) {
        ordenSeleccionadaId = idOrden;
        modalOrdenes.classList.add("hidden");
        
        document.getElementById("txt-orden-vinculada").value = `ORDEN DE COMPRA: OC-${idOrden}`;
        tbodyIngresoDetalle.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #64748b;">Extrayendo insumos solicitados...</td></tr>`;

        fetch(`http://localhost:3000/api/almacen/ordenes/${idOrden}/detalles`)
            .then(res => res.json())
            .then(detalles => {
                insumosDeLaOrden = detalles;
                tbodyIngresoDetalle.innerHTML = "";

                let htmlInsumos = "";
                insumosDeLaOrden.forEach(ins => {
                    htmlInsumos += `
                        <tr>
                            <td><strong>${ins.nombreInsumo || ins.nombre}</strong></td>
                            <td>${ins.cantidadRequerida} unidades</td>
                            <td>S/. ${parseFloat(ins.precioCompra).toFixed(2)}</td>
                            <td>
                                <input type="number" class="form-control input-recibido" 
                                    data-id="${ins.idInsumo}" 
                                    value="${ins.cantidadRequerida}" 
                                    min="0" style="width: 110px; font-weight: bold; color: #10b981;">
                            </td>
                        </tr>
                    `;
                });
                tbodyIngresoDetalle.innerHTML = htmlInsumos;
            })
            .catch(err => {
                alert("Error al cargar los ítems de la orden: " + err.message);
                tbodyIngresoDetalle.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #f87171;">Error al poblar la tabla.</td></tr>`;
            });
    };

    // ==========================================
    // 3. ENVIAR TRANSACCIÓN DE NOTA DE INGRESO
    // ==========================================
    formIngreso.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!ordenSeleccionadaId) {
            alert("[ERROR] Debe seleccionar una orden de compra pendiente de la lista.");
            return;
        }

        const inputs = document.querySelectorAll(".input-recibido");
        const detallesEnvio = [];
        let datosValidos = true;

        inputs.forEach(input => {
            const idInsumo = parseInt(input.getAttribute("data-id"), 10);
            const cantidadRecibida = parseInt(input.value, 10);

            if (isNaN(cantidadRecibida) || cantidadRecibida < 0) {
                datosValidos = false;
            } else {
                // Sincronizado milimétricamente con d.cantidadRecibida y d.idInsumo de server.js
                detallesEnvio.push({
                    idInsumo: idInsumo,
                    cantidadRecibida: cantidadRecibida
                });
            }
        });

        if (!datosValidos) {
            alert("[ERROR] Ingrese un número válido (mayor o igual a cero) en las cantidades recibidas.");
            return;
        }

        // Estructura limpia requerida por el backend en /api/ingresos o /api/almacen/ingresos
        const payload = {
            idOrdenCompra: parseInt(ordenSeleccionadaId, 10),
            idUsuario: usuarioSesion.idUsuario,
            detalles: detallesEnvio
        };

        // Verificamos si tu servidor usa /api/ingresos o /api/almacen/ingresos y lanzamos la petición
        fetch('http://localhost:3000/api/almacen/ingresos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);

            alert(`[TRANSACCIÓN EXITOSA]\n\nNota de Ingreso N° ${data.idNotaIngreso} grabada en MySQL.\nLa Orden OC-${ordenSeleccionadaId} cambió su estado a 'Recibida' y el inventario fue actualizado.`);
            
            // Limpieza completa de variables e interfaz
            ordenSeleccionadaId = null;
            insumosDeLaOrden = [];
            formIngreso.reset();
            document.getElementById("txt-orden-vinculada").value = "Ninguna seleccionada";
            tbodyIngresoDetalle.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #64748b;">Haga clic en 'Buscar Orden de Insumos' para cargar los requerimientos pendientes.</td></tr>`;
        })
        .catch(err => alert("Error al registrar ingreso: " + err.message));
    });

    btnSalirIngreso.addEventListener("click", () => {
        if (confirm("¿Desea salir del módulo de Ingreso de Insumos?")) {
            window.location.href = "index.html";
        }
    });
});