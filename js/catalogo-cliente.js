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
});