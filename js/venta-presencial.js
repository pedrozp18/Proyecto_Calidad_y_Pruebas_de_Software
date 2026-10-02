/**
 * js/venta-presencial.js
 * Lógica transaccional para el CU: Registrar Venta de Boletos Presencial
 * Sincronizado al 100% con tu HTML y server.js
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Verificación de Precondición de Sistema (Caja Abierta)
    const cajaData = JSON.parse(localStorage.getItem("caja_activa"));
    if (!cajaData || cajaData.estado !== "Abierta") {
        alert("[ALERTA DE SEGURIDAD] La caja no se encuentra abierta en este turno. Redirigiendo a Apertura...");
        window.location.href = "aperturar-caja.html";
        return;
    }

    // Actualizar datos estéticos en la interfaz de forma segura
    const elCajeroNav = document.getElementById("lbl-cajero-nav");
    if (elCajeroNav && cajaData.cajeroAsignado) {
        elCajeroNav.innerText = "Operador: " + cajaData.cajeroAsignado.split(' ')[0];
    }
    const elCajaActiva = document.getElementById("lbl-caja-activa");
    if (elCajaActiva && cajaData.numeroCajaFisica) {
        elCajaActiva.innerHTML = '<i class="fa-solid fa-cash-register"></i> ' + cajaData.numeroCajaFisica + ' | Activa';
    }

    // Variables de Estado Interno
    let precioUnitarioBase = 0;
    let asientosSeleccionados = [];
    let porcentajeDescuento = 0;
    let listaFuncionesCargadas = [];

    // Componentes del DOM Sincronizados con venta-presencial.html
    const selectFuncion = document.getElementById("select-funcion");
    const contenedorButacas = document.getElementById("contenedor-butacas");
    const panelMapa = document.getElementById("panel-mapa-sala");
    const btnBuscarFuncion = document.getElementById("btn-buscar-funcion"); 

    const txtDni = document.getElementById("txt-dni"); // ID Real de tu HTML
    const btnValidarAfiliacion = document.getElementById("btn-validar-afiliacion");
    const txtDescuentoTipo = document.getElementById("txt-descuento-tipo"); // ID Real de tu HTML
    const btnProcesarPago = document.getElementById("btn-procesar-pago");

    // 2. Cargar Funciones Activas desde el Servidor
    fetch('http://localhost:3000/api/ventas/funciones-activas')
        .then(res => res.json())
        .then(funciones => {
            listaFuncionesCargadas = funciones;
            if (selectFuncion) {
                selectFuncion.innerHTML = '<option value="">-- Seleccione Función de Cartelera --</option>';
                funciones.forEach(f => {
                    const fechaLimpia = f.fecha ? f.fecha.split('T')[0] : '';
                    selectFuncion.innerHTML += `<option value="${f.idFuncion}">${f.titulo} - Sala ${f.idSala} (${fechaLimpia} ${f.horarioInicio})</option>`;
                });
            }
        })
        .catch(err => console.error("Error al cargar funciones activas:", err));

    // 3. Buscar Función y Desplegar Matriz Gráfica de Butacas Dinámica
    if (btnBuscarFuncion) {
        btnBuscarFuncion.addEventListener("click", () => {
            const idFuncion = parseInt(selectFuncion.value);
            if (!idFuncion) {
                alert("Por favor, seleccione una función válida de la lista.");
                return;
            }

            const funcionElegida = listaFuncionesCargadas.find(f => f.idFuncion === idFuncion);
            const capacidadSala = funcionElegida && funcionElegida.capacidad ? parseInt(funcionElegida.capacidad) : 40;
            precioUnitarioBase = funcionElegida ? parseFloat(funcionElegida.precioBase) : 15.00;

            // Reiniciar selecciones previas
            asientosSeleccionados = [];
            actualizarLiquidacion();

            // Consultar asientos ocupados desde MySQL
            fetch('http://localhost:3000/api/ventas/asientos-ocupados/' + idFuncion)
                .then(res => res.json())
                .then(asientosOcupados => {
                    const ocupados = Array.isArray(asientosOcupados) ? asientosOcupados : [];
                    
                    if (contenedorButacas) {
                        contenedorButacas.innerHTML = "";
                        const asientosPorFila = 10; 
                        const totalFilasNecesarias = Math.ceil(capacidadSala / asientosPorFila);
                        contenedorButacas.style.gridTemplateColumns = `repeat(${asientosPorFila}, 1fr)`;

                        let asientoContador = 0;

                        for (let f = 0; f < totalFilasNecesarias; f++) {
                            const letraFila = String.fromCharCode(65 + f); 

                            for (let c = 1; c <= asientosPorFila; c++) {
                                if (asientoContador >= capacidadSala) break;

                                const codigoButaca = letraFila + c;
                                const boton = document.createElement("button");
                                boton.type = "button";
                                boton.className = "butaca";
                                boton.innerText = codigoButaca;

                                if (ocupados.includes(codigoButaca)) {
                                    // Cambiado a "ocupada" para que coincida con tus estilos CSS de venta-presencial.html
                                    boton.classList.add("ocupada");
                                    boton.disabled = true;
                                } else {
                                    boton.addEventListener("click", () => {
                                        if (boton.classList.contains("seleccionada")) {
                                            boton.classList.remove("seleccionada");
                                            asientosSeleccionados = asientosSeleccionados.filter(a => a !== codigoButaca);
                                        } else {
                                            boton.classList.add("seleccionada");
                                            asientosSeleccionados.push(codigoButaca);
                                        }
                                        actualizarLiquidacion();
                                    });
                                }
                                contenedorButacas.appendChild(boton);
                                asientoContador++;
                            }
                        }
                    }
                    if (panelMapa) panelMapa.classList.remove("hidden");
                })
                .catch(err => console.error("Error al sincronizar butacas:", err));
        });
    }

    // 4. Botón Validar Afiliación (Corregido para leer 'txtDni' real)
    if (btnValidarAfiliacion) {
        btnValidarAfiliacion.addEventListener("click", () => {
            const dniVal = txtDni ? txtDni.value.trim() : "";

            if (dniVal.length !== 8 || isNaN(dniVal)) {
                alert("[ERROR] Por favor, ingrese un número de DNI válido de 8 dígitos.");
                porcentajeDescuento = 0;
                if (txtDescuentoTipo) txtDescuentoTipo.value = "DNI Inválido";
                actualizarLiquidacion();
                return;
            }

            if (dniVal.startsWith("7")) {
                porcentajeDescuento = 0.20; // 20% descuento UPN
                if (txtDescuentoTipo) {
                    txtDescuentoTipo.value = "Convenio Estudiante UPN (20% Desc.)";
                    txtDescuentoTipo.style.color = "#10b981";
                }
            } else {
                porcentajeDescuento = 0;
                if (txtDescuentoTipo) {
                    txtDescuentoTipo.value = "Cliente Regular (Sin Descuento)";
                    txtDescuentoTipo.style.color = "#ffffff";
                }
            }
            actualizarLiquidacion();
            alert("✔ DNI validado formalmente.");
        });
    }

    // 5. Calcular Precios en Tiempo Real
    function actualizarLiquidacion() {
        const cantidad = asientosSeleccionados.length;
        const subtotal = cantidad * precioUnitarioBase;
        const descuento = subtotal * porcentajeDescuento;
        const totalNeto = subtotal - descuento;

        const elCant = document.getElementById("lbl-resumen-cant");
        if (elCant) elCant.innerText = cantidad;

        const elAsientos = document.getElementById("lbl-resumen-asientos");
        if (elAsientos) {
            elAsientos.innerText = cantidad > 0 ? asientosSeleccionados.join(", ") : "-";
        }

        const elPrecio = document.getElementById("lbl-resumen-precio");
        if (elPrecio) elPrecio.innerText = "S/ " + precioUnitarioBase.toFixed(2);
        
        const elDesc = document.getElementById("lbl-resumen-desc");
        if (elDesc) elDesc.innerText = "- S/ " + descuento.toFixed(2);

        const elTotal = document.getElementById("lbl-resumen-total");
        if (elTotal) elTotal.innerText = "S/ " + totalNeto.toFixed(2);

        if (btnProcesarPago) {
            btnProcesarPago.disabled = (cantidad === 0);
        }
    }

    // 6. Enviar la Venta a MySQL (form-venta)
    const formularioVenta = document.getElementById("form-venta");
    if (formularioVenta) {
        formularioVenta.addEventListener("submit", (e) => {
            e.preventDefault(); 

            const idFuncion = parseInt(selectFuncion.value);
            if (!idFuncion || asientosSeleccionados.length === 0) {
                alert("Error: Debe elegir una función y al menos un asiento.");
                return;
            }

            const cantidad = asientosSeleccionados.length;
            const subtotal = cantidad * precioUnitarioBase;
            const descuento = subtotal * porcentajeDescuento;
            const totalNeto = subtotal - descuento;

            // Extraemos de forma segura el ID de sesión de caja
            const sesionId = cajaData && cajaData.idSesionCaja ? parseInt(cajaData.idSesionCaja) : 1;

            const payload = {
                idSesionCaja: sesionId,
                idFuncion: idFuncion,
                dniCliente: txtDni ? txtDni.value.trim() : "00000000",
                subtotal: subtotal,
                descuento: descuento,
                totalNeto: totalNeto,
                asientos: asientosSeleccionados
            };

            fetch('http://localhost:3000/api/ventas/procesar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(errData => {
                        throw new Error(errData.error || "Error interno del servidor.");
                    });
                }
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    cajaData.saldoActual = parseFloat(cajaData.saldoActual || 0) + totalNeto;
                    localStorage.setItem("caja_activa", JSON.stringify(cajaData));

                    alert(`[VENTA CONSOLIDADA CON ÉXITO]\n\nCódigo de Venta: VNT-${data.idVenta}\nAsientos Reservados: ${asientosSeleccionados.join(", ")}\nTotal Cobrado: S/ ${totalNeto.toFixed(2)}`);
                    
                    // Limpieza de interfaz para la siguiente transacción
                    if (panelMapa) panelMapa.classList.add("hidden");
                    if (selectFuncion) selectFuncion.value = "";
                    if (txtDni) txtDni.value = "";
                    if (txtDescuentoTipo) {
                        txtDescuentoTipo.value = "Cliente Regular (Sin Descuento)";
                        txtDescuentoTipo.style.color = "#ffffff";
                    }
                    asientosSeleccionados = [];
                    actualizarLiquidacion();
                } else {
                    alert("Error en la transacción: " + data.message);
                }
            })
            .catch(err => {
                console.error(err);
                alert("Error de Servidor (MySQL):\n" + err.message + "\n\n💡 Consejo: Verifica que el DNI exista en tu tabla 'Cliente' o que la sesión de caja sea correcta.");
            });
        });
    }

    // Cancelar la operación actual
    const btnSalirVenta = document.getElementById("btn-salir-venta");
    if (btnSalirVenta) {
        btnSalirVenta.addEventListener("click", () => {
            if (confirm("¿Desea cancelar la transacción actual? Se perderá la selección de butacas.")) {
                if (panelMapa) panelMapa.classList.add("hidden");
                if (selectFuncion) selectFuncion.value = "";
                if (txtDni) txtDni.value = "";
                asientosSeleccionados = [];
                actualizarLiquidacion();
            }
        });
    }
});