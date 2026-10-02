document.addEventListener("DOMContentLoaded", () => {
    cargarDatos();
    listarFunciones();
    
    // NUEVA LÓGICA: Sincronizar el combo box de cartelera con el precio base oculto
    const selectTipo = document.getElementById("select-tipo-cartelera");
    const inputPrecio = document.getElementById("num-precio");

    if (selectTipo && inputPrecio) {
        selectTipo.addEventListener("change", () => {
            inputPrecio.value = selectTipo.value;
        });
    }

    document.getElementById("form-funcion").addEventListener("submit", guardarFuncion);
});

// Cargar opciones en los selects (Se mantiene igual)
function cargarDatos() {
    fetch('http://localhost:3000/api/datos-programacion')
        .then(res => res.json())
        .then(data => {
            const selectPeli = document.getElementById("select-pelicula");
            const selectSala = document.getElementById("select-sala");
            
            selectPeli.innerHTML = '<option value="">-- Seleccione Película --</option>';
            data.peliculas.forEach(p => selectPeli.innerHTML += `<option value="${p.idPelicula}">${p.titulo}</option>`);
            
            selectSala.innerHTML = '<option value="">-- Seleccione Sala --</option>';
            data.salas.forEach(s => selectSala.innerHTML += `<option value="${s.idSala}">Sala ${s.idSala}</option>`);
        });
}

// Guardar nueva función
function guardarFuncion(e) {
    e.preventDefault();
    
    // Validación de seguridad previa antes del envío
    const precioDetectado = document.getElementById("num-precio").value;
    if (!precioDetectado || precioDetectado === "") {
        alert("[ERROR] Por favor, elija un tipo de cartelera válido para calcular la tarifa.");
        return;
    }

    const data = {
        idPelicula: document.getElementById("select-pelicula").value,
        idSala: document.getElementById("select-sala").value,
        fecha: document.getElementById("date-fecha").value,
        horarioInicio: document.getElementById("time-inicio").value,
        horarioFin: "00:00", 
        precioBase: precioDetectado
    };

    fetch('http://localhost:3000/api/funciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(() => {
        alert("Función programada con éxito");
        document.getElementById("form-funcion").reset();
        document.getElementById("num-precio").value = ""; // Limpiar valor oculto auxiliar
        listarFunciones();
    });
}

// Listar funciones (Se mantiene igual)
function listarFunciones() {
    fetch('http://localhost:3000/api/funciones')
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("tbody-funciones");
            tbody.innerHTML = ""; 

            data.forEach(f => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${f.titulo}</td>
                    <td>Sala ${f.idSala}</td>
                    <td>${f.fecha.split('T')[0]} <br> <small>${f.horarioInicio}</small></td>
                    <td>S/ ${parseFloat(f.precioBase).toFixed(2)}</td>
                    <td><span class="badge" style="background:#10b981; color:white; padding:2px 6px; border-radius:4px;">${f.estado}</span></td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error al listar funciones:", err));
}