/**
 * js/mantener-peliculas.js
 * Lógica del CU: Mantener Películas (CRUD - Conectado a MySQL)
 */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-pelicula");
    const tbody = document.getElementById("tbody-peliculas");
    const btnLimpiar = document.getElementById("btn-limpiar");

    // Ejecutar la carga inicial desde la base de datos
    renderizarTabla();

    // 1. LISTAR / LEER REGISTROS (GET)
    function renderizarTabla() {
        fetch('http://localhost:3000/api/peliculas')
            .then(res => {
                if (!res.ok) throw new Error("Error al obtener el catálogo desde el servidor.");
                return res.json();
            })
            .then(data => {
                tbody.innerHTML = ""; // Limpiar tabla

                if (data.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #64748b;">No hay películas registradas en la base de datos.</td></tr>`;
                    return;
                }

                // Generar las filas dinámicamente con los campos de la tabla Pelicula
                data.forEach(p => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td><strong>#${p.idPelicula}</strong></td>
                        <td>${p.titulo}</td>
                        <td>${p.genero}</td>
                        <td>${p.duracion} min</td>
                        <td><span class="badge-info">Apt. Todo Público</span></td>
                        <td>
                            <button class="btn-action btn-delete" onclick="eliminarPelicula(${p.idPelicula})">
                                <i class="fa-solid fa-trash-can"></i> Retirar
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            })
            .catch(err => console.error("Error al renderizar tabla:", err));
    }

    // 2. CREAR / INSERTAR REGISTRO (POST)
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const titulo = document.getElementById("txt-titulo").value.trim();
        const genero = document.getElementById("select-genero").value;
        const duracion = parseInt(document.getElementById("num-duracion").value);
        const sipnosis = "Sin sinopsis detallada temporal."; // Valor por defecto ya que tu HTML actual no tiene el campo en el formulario

        // Regla de integridad de negocio
        if (isNaN(duracion) || duracion <= 0) {
            alert("Datos no válidos. La duración debe ser mayor a 0 minutos.");
            return;
        }

        const nuevaPelicula = { titulo, duracion, genero, sipnosis };

        fetch('http://localhost:3000/api/peliculas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaPelicula)
        })
        .then(res => {
            if (!res.ok) throw new Error("No se pudo guardar la película en el servidor.");
            return res.json();
        })
        .then(data => {
            alert(`[REGISTRO EXITOSO]\nLa película "${titulo}" ha sido guardada en la base de datos (ID: ${data.idPelicula || 'Asignado'}).`);
            form.reset();
            renderizarTabla(); // Refrescar la tabla automáticamente
        })
        .catch(err => {
            alert("Error al guardar la película: " + err.message);
        });
    });

    // 3. ELIMINAR / RETIRAR REGISTRO (DELETE)
    window.eliminarPelicula = function(id) {
        if (confirm("¿Está seguro de que desea retirar esta película del catálogo? Se perderá la referencia en la base de datos.")) {
            
            fetch(`http://localhost:3000/api/peliculas/${id}`, {
                method: 'DELETE'
            })
            .then(res => {
                return res.json().then(data => {
                    if (!res.ok) throw new Error(data.error || "Error al eliminar.");
                    return data;
                });
            })
            .then(data => {
                alert(`[ELIMINACIÓN EXITOSA]\n${data.message}`);
                renderizarTabla(); // Refrescar la tabla automáticamente
            })
            .catch(err => {
                alert("Operación cancelada: " + err.message);
            });
        }
    };

    // Botón Limpiar formulario
    btnLimpiar.addEventListener("click", () => form.reset());
});