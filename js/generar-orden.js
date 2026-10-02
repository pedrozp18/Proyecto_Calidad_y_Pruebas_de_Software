/**
 * js/generar-orden.js
 * Código unificado y reconstruído desde cero para evitar conflictos en el DOM
 */

document.addEventListener("DOMContentLoaded", () => {
    // Configurar fecha de emisión actual de forma automática
    const txtFecha = document.getElementById("txt-fecha-emision");
    if (txtFecha) {
        const hoy = new Date();
        const dd = String(hoy.getDate()).padStart(2, '0');
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const yyyy = hoy.getFullYear();
        txtFecha.value = `${dd}/${mm}/${yyyy}`;
    }

    const usuarioSesion = JSON.parse(localStorage.getItem("usuario_sesion")) || { idUsuario: 1 };
    
    let insumosBajoStock = [];
    let proveedorSeleccionadoId = null;

    // Captura limpia de elementos del DOM
    const btnVerificarStock = document.getElementById("btn-verificar-stock");
    const tbodyDetalle = document.getElementById("tbody-detalle");
    const btnBuscarProv = document.getElementById("btn-buscar-prov");
    const modalProveedor = document.getElementById("modal-proveedor");
    const btnCloseModal = document.getElementById("btn-close-modal");
    const btnCancelarModal = document.getElementById("btn-cancelar-modal");
    const btnEjecutarBusqueda = document.getElementById("btn-ejecutar-busqueda");
    const txtFiltroProv = document.getElementById("txt-filtro-prov");
    const tbodyModalProv = document.getElementById("tbody-modal-prov");
    const formOrden = document.getElementById("form-orden");
    const btnSalirOrden = document.getElementById("btn-salir-orden");

    // ==========================================
    // 1. CONTROL DE APERTURA Y CIERRE DEL MODAL
    // ==========================================
    btnBuscarProv.addEventListener("click", () => {
        modalProveedor.classList.remove("hidden");
        txtFiltroProv.value = "";
        tbodyModalProv.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b;">Ingrese un criterio y haga clic en Buscar.</td></tr>`;
        txtFiltroProv.focus();
    });

    const cerrarModal = () => { modalProveedor.classList.add("hidden"); };
    if (btnCloseModal) btnCloseModal.addEventListener("click", cerrarModal);
    if (btnCancelarModal) btnCancelarModal.addEventListener("click", cerrarModal);

    // ==========================================
    // 2. BÚSQUEDA DINÁMICA DE PROVEEDORES
    // ==========================================
    btnEjecutarBusqueda.addEventListener("click", () => {
        const criterio = txtFiltroProv.value.trim();
        
        fetch(`http://localhost:3000/api/almacen/proveedores/buscar?criterio=${encodeURIComponent(criterio)}`)
            .then(res => res.json())
            .then(data => {
                tbodyModalProv.innerHTML = "";

                if (data.length === 0) {
                    tbodyModalProv.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #f87171;">No se encontraron proveedores activos.</td></tr>`;
                    return;
                }

                let htmlFilas = "";
                data.forEach(p => {
                    const idReal = p.idProveedor || p.id;
                    // Guardamos los datos de forma segura escapando comillas para evitar rupturas de string
                    const razonSocialEscapada = p.razonSocial.replace(/'/g, "\\'");
                    
                    htmlFilas += `
                        <tr>
                            <td>#${idReal}</td>
                            <td><strong>${p.razonSocial}</strong></td>
                            <td>${p.ruc}</td>
                            <td><span class="badge badge-success">${p.estado}</span></td>
                            <td style="text-align: center;">
                                <button type="button" class="btn btn-success" style="padding: 5px 12px; font-size: 0.85rem;" 
                                    onclick="asignarProveedorDirecto('${idReal}', '${razonSocialEscapada}')">
                                    Seleccionar
                                </button>
                            </td>
                        </tr>
                    `;
                });
                tbodyModalProv.innerHTML = htmlFilas;
            })
            .catch(err => console.error("Error al buscar proveedores:", err));
    });

    // ==========================================
    // 3. ASIGNACIÓN ASÍNCRONA DESDE EL BOTÓN DE LA FILA
    // ==========================================
    window.asignarProveedorDirecto = function(id, razonSocial) {
        proveedorSeleccionadoId = id;
        
        // Colocar la información directamente en el formulario principal
        document.getElementById("txt-proveedor-cod").value = `PROV-${id}`;
        document.getElementById("txt-proveedor-nombre").value = razonSocial;
        
        // Cerrar de inmediato el modal de forma limpia
        modalProveedor.classList.add("hidden");
    };

    // ==========================================
    // 4. VERIFICAR E INYECTAR INSUMOS (CRÍTICOS O TODOS)
    // ==========================================
    const btnVerTodosInsumos = document.getElementById("btn-ver-todos-insumos");
    const thTipoInsumo = document.getElementById("th-tipo-insumo");

    // Función unificada para renderizar los insumos en la tabla de requerimientos
    function poblarTablaInsumos(urlEndpoint, esCritico) {
        fetch(urlEndpoint)
            .then(res => res.json())
            .then(data => {
                insumosBajoStock = data; // Reutilizamos el array global para el submit del formulario
                tbodyDetalle.innerHTML = "";

                if (insumosBajoStock.length === 0) {
                    tbodyDetalle.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #10b981;">✔ No hay insumos devueltos por el servidor.</td></tr>`;
                    return;
                }

                // Cambiar el título de la columna dinámicamente según la observación
                thTipoInsumo.innerText = esCritico ? "Insumo Crítico" : "Insumo Seleccionado";

                insumosBajoStock.forEach(ins => {
                    // Si es crítico calcula la diferencia para reponer, si son todos pone 10 unidades por defecto
                    const cantidadSugerida = esCritico 
                        ? (ins.stockMinimo - ins.stockActual) + 10 
                        : 10;
                    
                    // Si es crítico resalta en rojo, si no lo deja normal
                    const estiloStock = ins.stockActual <= ins.stockMinimo 
                        ? "color:#f87171; font-weight:bold;" 
                        : "color:#f8fafc;";

                    tbodyDetalle.innerHTML += `
                        <tr id="fila-${ins.idInsumo}">
                            <td><strong>${ins.nombre}</strong></td>
                            <td style="${estiloStock}">${ins.stockActual} (Min: ${ins.stockMinimo})</td>
                            <td>
                                <input type="number" class="form-control input-cantidad" data-id="${ins.idInsumo}" value="${cantidadSugerida}" style="width:90px;" min="1">
                            </td>
                            <td>
                                <input type="number" class="form-control input-precio" data-id="${ins.idInsumo}" value="${ins.precioSugerido}" style="width:100px;" step="0.01" min="0.1">
                            </td>
                            <td>
                                <button type="button" class="btn btn-danger" onclick="quitarInsumoDetalle(${ins.idInsumo})" style="padding:4px 8px;">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            })
            .catch(err => alert("Error al cargar insumos: " + err.message));
    }

    // Evento del botón original (Stock Crítico)
    btnVerificarStock.addEventListener("click", () => {
        poblarTablaInsumos('http://localhost:3000/api/almacen/insumos/criticos', true);
    });

    // Evento del nuevo botón (Ver todos los insumos de almacén)
    btnVerTodosInsumos.addEventListener("click", () => {
        poblarTablaInsumos('http://localhost:3000/api/almacen/insumos', false);
    });

    // ==========================================
    // 5. REGISTRAR ORDEN DE COMPRA COMPLETA
    // ==========================================
    formOrden.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!proveedorSeleccionadoId) {
            alert("[ERROR] Por favor, busque y seleccione un proveedor antes de continuar.");
            return;
        }

        const filas = document.querySelectorAll("#tbody-detalle tr");
        if (filas.length === 0 || filas[0].querySelector('td').getAttribute('colspan')) {
            alert("[ERROR] La tabla de requerimientos está vacía. Verifique el stock crítico.");
            return;
        }

        const detallesEnvio = [];
        let datosValidos = true;

        filas.forEach(fila => {
            const inputCant = fila.querySelector(".input-cantidad");
            const inputPrec = fila.querySelector(".input-precio");

            if (inputCant && inputPrec) {
                const idInsumo = parseInt(inputCant.getAttribute("data-id"), 10);
                const cantidad = parseInt(inputCant.value, 10);
                const precio = parseFloat(inputPrec.value);

                if (isNaN(cantidad) || cantidad <= 0 || isNaN(precio) || precio <= 0) {
                    datosValidos = false;
                } else {
                    detallesEnvio.push({ idInsumo, cantidad, precio });
                }
            }
        });

        if (!datosValidos) {
            alert("[ERROR] Las cantidades y precios deben ser números mayores a cero.");
            return;
        }

        const payload = {
            idProveedor: parseInt(proveedorSeleccionadoId, 10),
            idUsuario: usuarioSesion.idUsuario,
            detalles: detallesEnvio
        };

        fetch('http://localhost:3000/api/almacen/ordenes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            
            alert(`[TRANSACCIÓN EXITOSA]\n\nOrden de compra registrada en MySQL.\nCódigo de Documento: OC-${data.idOrdenCompra}`);
            formOrden.reset();
            proveedorSeleccionadoId = null;
            tbodyDetalle.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #64748b;">Ejecute la verificación de stock para poblar los insumos con bajo inventario.</td></tr>`;
        })
        .catch(err => alert("Error al grabar orden: " + err.message));
    });

    window.quitarInsumoDetalle = function(id) {
        const fila = document.getElementById(`fila-${id}`);
        if (fila) fila.remove();
    };

    btnSalirOrden.addEventListener("click", () => {
        if (confirm("¿Desea salir de este módulo?")) window.location.href = "index.html";
    });
});