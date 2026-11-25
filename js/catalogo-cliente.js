document.addEventListener("DOMContentLoaded", () => {
    // 1. Validar Sesión del Cliente
    const clienteSesion = JSON.parse(localStorage.getItem("cliente_sesion"));
    
    if (!clienteSesion) {
        alert("Debe iniciar sesión para acceder al catálogo.");
        window.location.href = "login-cliente.html";
        return;
    }

    // Cargar datos de la cabecera
    const nombreCliente = clienteSesion.nombre || clienteSesion.nombres || clienteSesion.usuario || "Cliente";
    const tipoMembresia = clienteSesion.tipoMembresia || clienteSesion.membresia || 'Estándar';

    document.getElementById("lblCliente").textContent = `Hola, ${nombreCliente}`;
    document.getElementById("lblMembresia").textContent = `Membresía: ${tipoMembresia}`;

    // Cargar Catálogo
    cargarCartelera();

    // Evento Logout
    document.getElementById("btnLogout").addEventListener("click", () => {
        localStorage.removeItem("cliente_sesion");
        window.location.href = "login-cliente.html";
    });
});

let funcionSeleccionada = null;

async function cargarCartelera() {
    try {
        const res = await fetch("/api/cartelera");
        const peliculas = await res.json();
        const contenedor = document.getElementById("contenedorPeliculas");
        contenedor.innerHTML = "";

        peliculas.forEach(pelicula => {
            // Mapeo limpio sin caracteres erróneos
            let opcionesFunciones = pelicula.funciones.map(f => 
                `<option value="${f.idFuncion}" data-precio="${f.precio}">${f.horario} - Sala ${f.numeroSala} (S/ ${f.precio})</option>`
            ).join("");

            // Validación de la ruta de la imagen
            let rawImagen = pelicula.imagen || pelicula.imagenPoster;
            let rutaImagen = '';

            if (!rawImagen) {
                rutaImagen = 'https://via.placeholder.com/300x400?text=Sin+Imagen';
            } else if (rawImagen.startsWith('http')) {
                rutaImagen = rawImagen;
            } else if (rawImagen.startsWith('img/')) {
                rutaImagen = rawImagen;
            } else {
                rutaImagen = `img/${rawImagen}`;
            }

            contenedor.innerHTML += `
                <div class="movie-card">
                    <img src="${rutaImagen}" 
                         class="movie-poster" 
                         alt="${pelicula.titulo}"
                         onerror="this.src='https://via.placeholder.com/300x400?text=Sin+Imagen'">
                    <div class="movie-info">
                        <div class="movie-title">${pelicula.titulo}</div>
                        <div class="movie-genre">${pelicula.genero} | ${pelicula.duracion} min</div>
                        
                        <select class="function-select" id="select-funcion-${pelicula.idPelicula}">
                            <option value="">-- Seleccionar Función --</option>
                            ${opcionesFunciones}
                        </select>
                        
                        <button class="btn-buy" onclick="abrirModalCompra(${pelicula.idPelicula}, '${pelicula.titulo}')">
                            Comprar Entradas
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error al cargar cartelera:", error);
    }
}

function abrirModalCompra(idPelicula, titulo) {
    const select = document.getElementById(`select-funcion-${idPelicula}`);
    const idFuncion = select.value;

    if (!idFuncion) {
        alert("Por favor seleccione una función de la lista.");
        return;
    }

    const optionSelected = select.options[select.selectedIndex];
    const precioFuncion = parseFloat(optionSelected.getAttribute("data-precio")) || 18.00;

    funcionSeleccionada = { idFuncion, titulo, precio: precioFuncion };
    
    document.getElementById("modalTituloPelicula").textContent = titulo;
    document.getElementById("modalDetalleFuncion").textContent = optionSelected.text;
    document.getElementById("numEntradas").value = 1;
    
    actualizarTotal();
    document.getElementById("modalCompra").style.display = "flex";
}

document.getElementById("numEntradas").addEventListener("input", actualizarTotal);

function actualizarTotal() {
    const cantidad = parseInt(document.getElementById("numEntradas").value) || 1;
    const precioActual = funcionSeleccionada ? funcionSeleccionada.precio : 15.00;
    const total = cantidad * precioActual;
    document.getElementById("lblMontoTotal").textContent = total.toFixed(2);
}

document.getElementById("btnCerrarModal").addEventListener("click", () => {
    document.getElementById("modalCompra").style.display = "none";
});

// Confirmar Compra de Entradas
document.getElementById("btnConfirmarCompra").addEventListener("click", async () => {
    const clienteSesion = JSON.parse(localStorage.getItem("cliente_sesion"));
    const cantidad = parseInt(document.getElementById("numEntradas").value);
    const total = parseFloat(document.getElementById("lblMontoTotal").textContent);

    try {
        const res = await fetch("/api/compra/entrada", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                idCliente: clienteSesion.idCliente,
                idFuncion: funcionSeleccionada.idFuncion,
                cantidad,
                total
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("¡Compra realizada con éxito! Revisa tu entrada en el correo.");
            document.getElementById("modalCompra").style.display = "none";
        } else {
            alert(data.error || "No se pudo procesar la compra.");
        }
    } catch (error) {
        console.error("Error al procesar compra:", error);
        alert("Error al conectar con el servidor.");
    }
    (() => {
    const API_BASE = 'http://localhost:3000';

    const CONFITERIA_FALLBACK = [
        { idProducto: 1, nombreProducto: 'Combo Dúo Clásico', categoria: 'Combo', precioVenta: 28.00 },
        { idProducto: 2, nombreProducto: 'Combo Familiar', categoria: 'Combo', precioVenta: 46.00 },
        { idProducto: 3, nombreProducto: 'Pop Corn Mantequilla', categoria: 'Snack', precioVenta: 12.00 },
        { idProducto: 4, nombreProducto: 'Gaseosa 22oz', categoria: 'Bebida', precioVenta: 8.50 },
        { idProducto: 5, nombreProducto: 'Nachos con Queso', categoria: 'Snack', precioVenta: 13.00 }
    ];

    let estadoCompra = {
        pelicula: null,
        funcion: null,
        asientos: [],
        ocupados: [],
        productos: [...CONFITERIA_FALLBACK],
        carritoConfi: {}, // { [idProducto]: cantidad }
        pasoActual: 'asientos' // 'asientos' | 'confiteria' | 'pago'
    };

    function inyectarEstilosModalCompra() {
        if (document.getElementById('estilos-modal-compra-cine')) return;
        const style = document.createElement('style');
        style.id = 'estilos-modal-compra-cine';
        style.textContent = `
            .cine-modal-backdrop {
                position: fixed; inset: 0; background: rgba(2, 6, 23, 0.82);
                display: flex; align-items: center; justify-content: center;
                z-index: 9999; padding: 16px;
            }
            .cine-modal-box {
                width: 100%; max-width: 660px; max-height: 90vh; overflow-y: auto;
                background: #131d33; color: #f8fafc; border: 1px solid #273756;
                border-radius: 12px; padding: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.6);
                font-family: inherit;
            }
            .cine-modal-header {
                display: flex; justify-content: space-between; align-items: flex-start;
                border-bottom: 1px solid #273756; padding-bottom: 14px; margin-bottom: 18px;
            }
            .cine-modal-titulo { margin: 0; font-size: 1.35rem; font-weight: 800; }
            .cine-modal-sub { color: #38bdf8; font-size: 0.92rem; margin-top: 4px; }
            .cine-btn-cerrar {
                background: transparent; border: none; color: #94a3b8;
                font-size: 1.4rem; cursor: pointer; line-height: 1;
            }
            .cine-tabs-pasos {
                display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
                margin-bottom: 20px;
            }
            .cine-tab-paso {
                background: #0b1222; color: #94a3b8; border: 1px solid #273756;
                padding: 10px; border-radius: 8px; font-weight: 700; font-size: 0.88rem;
                cursor: pointer; text-align: center; transition: all 0.2s;
            }
            .cine-tab-paso.activo {
                background: #1d4ed8; color: #fff; border-color: #3b82f6;
            }
            .cine-pantalla {
                background: #475569; color: #0f172a; font-weight: 800; font-size: 0.75rem;
                text-align: center; padding: 6px; border-radius: 0 0 12px 12px;
                margin: 0 auto 16px auto; max-width: 420px; letter-spacing: 1px;
            }
            .cine-grid-butacas {
                display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px;
                max-width: 420px; margin: 0 auto 16px auto;
            }
            .cine-butaca {
                padding: 8px 0; border-radius: 6px; border: none; font-weight: 700;
                font-size: 0.78rem; cursor: pointer; background: #64748b; color: #fff;
            }
            .cine-butaca.seleccionada { background: #ef4444; color: #fff; }
            .cine-butaca.ocupada { background: #1e293b; color: #475569; cursor: not-allowed; }
            .cine-confi-lista {
                display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                gap: 12px; margin-bottom: 16px;
            }
            .cine-confi-card {
                background: #0b1222; border: 1px solid #273756; border-radius: 8px;
                padding: 12px; display: flex; justify-content: space-between; align-items: center; gap: 10px;
            }
            .cine-confi-nombre { font-weight: 700; font-size: 0.92rem; }
            .cine-confi-cat { font-size: 0.76rem; color: #94a3b8; }
            .cine-confi-precio { color: #10b981; font-weight: 800; font-size: 0.9rem; margin-top: 4px; }
            .cine-qty-box { display: flex; align-items: center; gap: 8px; }
            .cine-qty-btn {
                width: 28px; height: 28px; border-radius: 6px; border: 1px solid #334155;
                background: #1e293b; color: #fff; font-weight: 700; cursor: pointer;
            }
            .cine-resumen-box {
                background: #0b1222; border: 1px solid #273756; border-radius: 8px;
                padding: 14px; margin-bottom: 18px;
            }
            .cine-fila-resumen {
                display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.92rem;
            }
            .cine-total-resumen {
                display: flex; justify-content: space-between; border-top: 1px dashed #334155;
                padding-top: 10px; font-size: 1.15rem; font-weight: 800; color: #10b981;
            }
            .cine-modal-footer {
                display: flex; justify-content: space-between; gap: 12px; margin-top: 14px;
            }
            .cine-btn-sec {
                flex: 1; padding: 11px 16px; border-radius: 8px; border: none;
                background: #64748b; color: #fff; font-weight: 700; cursor: pointer;
            }
            .cine-btn-pri {
                flex: 1; padding: 11px 16px; border-radius: 8px; border: none;
                background: #10b981; color: #fff; font-weight: 700; cursor: pointer;
            }
            .cine-input {
                width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 8px;
                border: 1px solid #334155; background: #0b1222; color: #fff; margin-top: 6px;
            }
        `;
        document.head.appendChild(style);
    }

    async function cargarConfiteria() {
        try {
            const res = await fetch(`${API_BASE}/api/confiteria/productos`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    estadoCompra.productos = data;
                    return;
                }
            }
        } catch (_) {
            // Usa respaldo local si el endpoint aún no responde
        }
        estadoCompra.productos = [...CONFITERIA_FALLBACK];
    }

    async function cargarAsientosOcupados(idFuncion) {
        if (!idFuncion) return [];
        try {
            const res = await fetch(`${API_BASE}/api/ventas/asientos-ocupados/${idFuncion}`);
            if (res.ok) {
                const data = await res.json();
                return Array.isArray(data) ? data : [];
            }
        } catch (_) {
            // Si no hay conexión, retorna vacío
        }
        return [];
    }

    function calcularTotales() {
        const precioEntrada = Number(estadoCompra.funcion?.precio || 18.00);
        const cantEntradas = estadoCompra.asientos.length;
        const subtotalEntradas = cantEntradas * precioEntrada;

        const subtotalConfi = estadoCompra.productos.reduce((acc, p) => {
            const cant = estadoCompra.carritoConfi[p.idProducto] || 0;
            return acc + cant * Number(p.precioVenta || 0);
        }, 0);

        return {
            cantEntradas,
            precioEntrada,
            subtotalEntradas,
            subtotalConfi,
            totalPagar: subtotalEntradas + subtotalConfi
        };
    }

    function cerrarModalCompra() {
        const backdrop = document.getElementById('modal-compra-integral');
        if (backdrop) backdrop.remove();
    }

    function renderizarContenidoPaso() {
        const { cantEntradas, precioEntrada, subtotalEntradas, subtotalConfi, totalPagar } = calcularTotales();
        const bodyEl = document.getElementById('cine-modal-body');
        const footerEl = document.getElementById('cine-modal-footer');
        if (!bodyEl || !footerEl) return;

        document.querySelectorAll('.cine-tab-paso').forEach(tab => {
            tab.classList.toggle('activo', tab.dataset.paso === estadoCompra.pasoActual);
        });

        if (estadoCompra.pasoActual === 'asientos') {
            const filas = ['A', 'B', 'C', 'D', 'E'];
            const butacasHtml = [];
            filas.forEach(fila => {
                for (let num = 1; num <= 8; num++) {
                    const codigo = `${fila}${num}`;
                    const ocupada = estadoCompra.ocupados.includes(codigo);
                    const seleccionada = estadoCompra.asientos.includes(codigo);
                    butacasHtml.push(`
                        <button type="button"
                            class="cine-butaca ${ocupada ? 'ocupada' : ''} ${seleccionada ? 'seleccionada' : ''}"
                            data-asiento="${codigo}"
                            ${ocupada ? 'disabled' : ''}>
                            ${codigo}
                        </button>
                    `);
                }
            });

            bodyEl.innerHTML = `
                <div class="cine-pantalla">PANTALLA</div>
                <div class="cine-grid-butacas">${butacasHtml.join('')}</div>
                <div class="cine-resumen-box">
                    <div class="cine-fila-resumen">
                        <span>Asientos seleccionados:</span>
                        <strong>${cantEntradas > 0 ? estadoCompra.asientos.join(', ') : 'Ninguno'}</strong>
                    </div>
                    <div class="cine-fila-resumen">
                        <span>Entradas (${cantEntradas} x S/ ${precioEntrada.toFixed(2)}):</span>
                        <strong>S/ ${subtotalEntradas.toFixed(2)}</strong>
                    </div>
                </div>
            `;

            bodyEl.querySelectorAll('.cine-butaca:not(.ocupada)').forEach(btn => {
                btn.addEventListener('click', () => {
                    const cod = btn.dataset.asiento;
                    if (estadoCompra.asientos.includes(cod)) {
                        estadoCompra.asientos = estadoCompra.asientos.filter(a => a !== cod);
                    } else {
                        estadoCompra.asientos.push(cod);
                    }
                    renderizarContenidoPaso();
                });
            });

            footerEl.innerHTML = `
                <button type="button" class="cine-btn-sec" id="btn-cancelar-compra">Cancelar</button>
                <button type="button" class="cine-btn-pri" id="btn-ir-confiteria">Siguiente: Confitería →</button>
            `;

            document.getElementById('btn-cancelar-compra').onclick = cerrarModalCompra;
            document.getElementById('btn-ir-confiteria').onclick = () => {
                if (estadoCompra.asientos.length === 0) {
                    alert('Selecciona al menos un asiento para continuar.');
                    return;
                }
                estadoCompra.pasoActual = 'confiteria';
                renderizarContenidoPaso();
            };
            return;
        }

        if (estadoCompra.pasoActual === 'confiteria') {
            const itemsHtml = estadoCompra.productos.map(prod => {
                const cant = estadoCompra.carritoConfi[prod.idProducto] || 0;
                return `
                    <div class="cine-confi-card">
                        <div>
                            <div class="cine-confi-nombre">${prod.nombreProducto}</div>
                            <div class="cine-confi-cat">${prod.categoria || 'Confitería'}</div>
                            <div class="cine-confi-precio">S/ ${Number(prod.precioVenta || 0).toFixed(2)}</div>
                        </div>
                        <div class="cine-qty-box">
                            <button type="button" class="cine-qty-btn btn-menos" data-id="${prod.idProducto}">-</button>
                            <span>${cant}</span>
                            <button type="button" class="cine-qty-btn btn-mas" data-id="${prod.idProducto}">+</button>
                        </div>
                    </div>
                `;
            }).join('');

            bodyEl.innerHTML = `
                <p style="margin-top:0; color:#cbd5e1; font-size:0.9rem;">
                    Agrega combos, pop corn, bebidas o snacks (opcional):
                </p>
                <div class="cine-confi-lista">${itemsHtml}</div>
                <div class="cine-resumen-box">
                    <div class="cine-fila-resumen">
                        <span>Subtotal Entradas:</span>
                        <strong>S/ ${subtotalEntradas.toFixed(2)}</strong>
                    </div>
                    <div class="cine-fila-resumen">
                        <span>Subtotal Confitería:</span>
                        <strong>S/ ${subtotalConfi.toFixed(2)}</strong>
                    </div>
                    <div class="cine-total-resumen">
                        <span>Total a Pagar:</span>
                        <span>S/ ${totalPagar.toFixed(2)}</span>
                    </div>
                </div>
            `;

            bodyEl.querySelectorAll('.btn-menos').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.dataset.id;
                    const actual = estadoCompra.carritoConfi[id] || 0;
                    if (actual <= 1) delete estadoCompra.carritoConfi[id];
                    else estadoCompra.carritoConfi[id] = actual - 1;
                    renderizarContenidoPaso();
                };
            });

            bodyEl.querySelectorAll('.btn-mas').forEach(btn => {
                btn.onclick = () => {
                    const id = btn.dataset.id;
                    estadoCompra.carritoConfi[id] = (estadoCompra.carritoConfi[id] || 0) + 1;
                    renderizarContenidoPaso();
                };
            });

            footerEl.innerHTML = `
                <button type="button" class="cine-btn-sec" id="btn-volver-asientos">← Asientos</button>
                <button type="button" class="cine-btn-pri" id="btn-ir-pago">Ir al Pago (S/ ${totalPagar.toFixed(2)}) →</button>
            `;

            document.getElementById('btn-volver-asientos').onclick = () => {
                estadoCompra.pasoActual = 'asientos';
                renderizarContenidoPaso();
            };
            document.getElementById('btn-ir-pago').onclick = () => {
                estadoCompra.pasoActual = 'pago';
                renderizarContenidoPaso();
            };
            return;
        }

        // Paso 3: Pago
        const detalleConfi = estadoCompra.productos
            .filter(p => (estadoCompra.carritoConfi[p.idProducto] || 0) > 0)
            .map(p => {
                const c = estadoCompra.carritoConfi[p.idProducto];
                return `${c}x ${p.nombreProducto} (S/ ${(c * Number(p.precioVenta || 0)).toFixed(2)})`;
            });

        bodyEl.innerHTML = `
            <div class="cine-resumen-box">
                <div class="cine-fila-resumen">
                    <span>Película / Función:</span>
                    <strong>${estadoCompra.pelicula} (${estadoCompra.funcion.texto})</strong>
                </div>
                <div class="cine-fila-resumen">
                    <span>Asientos (${cantEntradas}):</span>
                    <strong>${estadoCompra.asientos.join(', ')}</strong>
                </div>
                <div class="cine-fila-resumen">
                    <span>Confitería:</span>
                    <strong>${detalleConfi.length > 0 ? detalleConfi.join(', ') : 'Sin productos adicionales'}</strong>
                </div>
                <div class="cine-total-resumen">
                    <span>Total a Pagar:</span>
                    <span>S/ ${totalPagar.toFixed(2)}</span>
                </div>
            </div>

            <div style="margin-bottom:12px;">
                <label style="font-size:0.88rem; font-weight:700;">DNI del Cliente</label>
                <input type="text" id="cine-dni-cliente" class="cine-input" maxlength="8" placeholder="Ej. 75432109">
            </div>

            <div>
                <label style="font-size:0.88rem; font-weight:700;">Método de Pago</label>
                <select id="cine-metodo-pago" class="cine-input">
                    <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                    <option value="Yape/Plin">Yape / Plin</option>
                    <option value="Efectivo">Efectivo</option>
                </select>
            </div>
        `;

        footerEl.innerHTML = `
            <button type="button" class="cine-btn-sec" id="btn-volver-confi">← Confitería</button>
            <button type="button" class="cine-btn-pri" id="btn-confirmar-pago-final">Confirmar Pago (S/ ${totalPagar.toFixed(2)})</button>
        `;

        document.getElementById('btn-volver-confi').onclick = () => {
            estadoCompra.pasoActual = 'confiteria';
            renderizarContenidoPaso();
        };

        document.getElementById('btn-confirmar-pago-final').onclick = async () => {
            const dniVal = (document.getElementById('cine-dni-cliente')?.value || '').trim();
            if (dniVal.length !== 8 || isNaN(dniVal)) {
                alert('Ingresa un DNI válido de 8 dígitos para continuar con el pago.');
                return;
            }

            const confiteriaItems = estadoCompra.productos
                .filter(p => (estadoCompra.carritoConfi[p.idProducto] || 0) > 0)
                .map(p => ({
                    idProducto: p.idProducto,
                    nombre: p.nombreProducto,
                    cantidad: estadoCompra.carritoConfi[p.idProducto],
                    precioUnitario: Number(p.precioVenta || 0)
                }));

            const payload = {
                idFuncion: estadoCompra.funcion.idFuncion || 1,
                dniCliente: dniVal,
                subtotal: totalPagar,
                descuento: 0,
                totalNeto: totalPagar,
                asientos: estadoCompra.asientos,
                confiteria: confiteriaItems,
                totalConfiteria: subtotalConfi,
                metodoPago: document.getElementById('cine-metodo-pago')?.value || 'Tarjeta'
            };

            try {
                const res = await fetch(`${API_BASE}/api/ventas/procesar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.error || data.message || 'No se pudo procesar el pago.');
                }
                alert(`¡Compra confirmada!\nCódigo: VNT-${data.idVenta || 'OK'}\nTotal pagado: S/ ${totalPagar.toFixed(2)}`);
                cerrarModalCompra();
            } catch (err) {
                alert(`Error al procesar el pago: ${err.message}`);
            }
        };
    }

    async function abrirModalCompra({ pelicula, funcion }) {
        inyectarEstilosModalCompra();
        cerrarModalCompra();

        estadoCompra = {
            pelicula,
            funcion,
            asientos: [],
            ocupados: await cargarAsientosOcupados(funcion.idFuncion),
            productos: estadoCompra.productos,
            carritoConfi: {},
            pasoActual: 'asientos'
        };

        await cargarConfiteria();

        const backdrop = document.createElement('div');
        backdrop.id = 'modal-compra-integral';
        backdrop.className = 'cine-modal-backdrop';
        backdrop.innerHTML = `
            <div class="cine-modal-box">
                <div class="cine-modal-header">
                    <div>
                        <h3 class="cine-modal-titulo">${pelicula}</h3>
                        <div class="cine-modal-sub">${funcion.texto}</div>
                    </div>
                    <button type="button" class="cine-btn-cerrar" id="cine-btn-x" title="Cerrar">&times;</button>
                </div>

                <div class="cine-tabs-pasos">
                    <button type="button" class="cine-tab-paso activo" data-paso="asientos">1. Asientos</button>
                    <button type="button" class="cine-tab-paso" data-paso="confiteria">2. Confitería</button>
                    <button type="button" class="cine-tab-paso" data-paso="pago">3. Pago</button>
                </div>

                <div id="cine-modal-body"></div>
                <div class="cine-modal-footer" id="cine-modal-footer"></div>
            </div>
        `;

        document.body.appendChild(backdrop);
        document.getElementById('cine-btn-x').onclick = cerrarModalCompra;

        backdrop.querySelectorAll('.cine-tab-paso').forEach(tab => {
            tab.onclick = () => {
                if (tab.dataset.paso !== 'asientos' && estadoCompra.asientos.length === 0) {
                    alert('Primero selecciona al menos un asiento.');
                    return;
                }
                estadoCompra.pasoActual = tab.dataset.paso;
                renderizarContenidoPaso();
            };
        });

        renderizarContenidoPaso();
    }

    // Exponer función global para invocarla desde el botón "Comprar Entradas" de cada tarjeta
    window.abrirModuloCompraPelicula = abrirModalCompra;

    // Auto-conectar botones "Comprar Entradas" si existen en la página
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.trim().toLowerCase().includes('comprar entradas')) {
                btn.addEventListener('click', (e) => {
                    const card = btn.closest('.card, .movie-card, .pelicula-card, div[class*="card"]') || btn.parentElement;
                    const titulo = card?.querySelector('h2, h3, h4, .titulo, .movie-title')?.textContent?.trim() || 'Avengers: Endgame';
                    const select = card?.querySelector('select');
                    const opcionSel = select?.selectedOptions?.[0];
                    const textoFuncion = opcionSel && opcionSel.value
                        ? opcionSel.textContent.trim()
                        : '19:00 - Sala Tradicional (S/ 18.00)';
                    const precioMatch = textoFuncion.match(/S\/\s*([0-9]+(?:\.[0-9]+)?)/);
                    const precio = precioMatch ? parseFloat(precioMatch[1]) : 18.00;
                    const idFuncion = opcionSel && !isNaN(parseInt(opcionSel.value, 10))
                        ? parseInt(opcionSel.value, 10)
                        : 1;

                    // Evita que un modal anterior básico bloquee este flujo si ya se abrió
                    e.preventDefault();
                    abrirModuloCompraPelicula({
                        pelicula: titulo,
                        funcion: { idFuncion, texto: textoFuncion, precio }
                    });
                });
            }
        });
    });
})();
});