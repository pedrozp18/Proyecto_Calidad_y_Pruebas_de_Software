document.addEventListener("DOMContentLoaded", () => {
    // 1. Validar Sesión del Cliente
    const clienteSesion = JSON.parse(localStorage.getItem("cliente_sesion"));
    
    if (!clienteSesion) {
        alert("Debe iniciar sesión para acceder al catálogo.");
        window.location.href = "login-cliente.html";
        return;
    }

    // Cargar datos de la cabecera
    document.getElementById("lblCliente").textContent = `Hola, ${clienteSesion.nombre}`;
    document.getElementById("lblMembresia").textContent = `Membresía: ${clienteSesion.tipoMembresia || 'Estándar'}`;

    // Cargar Catálogo
    cargarCartelera();

    // Evento Logout
    document.getElementById("btnLogout").addEventListener("click", () => {
        localStorage.removeItem("cliente_sesion");
        window.location.href = "login-cliente.html";
    });
});

let funcionSeleccionada = null;
let precioBase = 15.00; // Precio por entrada en soles

async function cargarCartelera() {
    try {
        const res = await fetch("/api/cartelera");
        const peliculas = await res.json();
        const contenedor = document.getElementById("contenedorPeliculas");
        contenedor.innerHTML = "";

        peliculas.forEach(pelicula => {
            let opcionesFunciones = pelicula.funciones.map(f => 
                `<option value="${f.idFuncion}">${f.horario} - Sala ${f.numeroSala} (S/ ${f.precio})</option>`
            ).join("");

            contenedor.innerHTML += `
                <div class="movie-card">
                    <img src="${pelicula.imagen || 'https://via.placeholder.com/300x400'}" class="movie-poster" alt="${pelicula.titulo}">
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

    funcionSeleccionada = { idFuncion, titulo, precio: precioBase };
    
    document.getElementById("modalTituloPelicula").textContent = titulo;
    document.getElementById("modalDetalleFuncion").textContent = select.options[select.selectedIndex].text;
    document.getElementById("numEntradas").value = 1;
    actualizarTotal();

    document.getElementById("modalCompra").style.display = "flex";
}

document.getElementById("numEntradas").addEventListener("input", actualizarTotal);

function actualizarTotal() {
    const cantidad = parseInt(document.getElementById("numEntradas").value) || 1;
    const total = cantidad * precioBase;
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