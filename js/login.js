/**
 * js/login.js
 * Lógica de negocio para el Caso de Uso: Validar Credenciales (Conectado a MySQL)
 */

// login.js
async function cargarSelectRoles() {
    try {
        const select = document.getElementById('select-rol') || document.querySelector('select'); // Asegura seleccionar el elemento correcto
        const res = await fetch('/api/roles');
        const roles = await res.json();

        select.innerHTML = '<option value="">-- Seleccione su Rol Asignado --</option>';
        
        roles.forEach(r => {
            // CORRECCIÓN: Se usa r.nombreRol e r.idRol (propiedades exactas devueltas por MySQL)
            // Si tu backend en /api/login evalúa abreviaturas como "EA", "C", "EP", puedes mapear r.nombreRol
            select.innerHTML += `<option value="${r.nombreRol}">${r.nombreRol}</option>`;
        });
    } catch (error) {
        console.error('Error al cargar la lista de roles:', error);
    }
}
cargarSelectRoles();
document.addEventListener("DOMContentLoaded", () => {
    const formLogin = document.getElementById("form-login");
    const alertError = document.getElementById("login-error");
    const errorMsg = document.getElementById("error-msg");

    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        alertError.classList.add("hidden");

        const usuario = document.getElementById("txt-usuario").value.trim();
        const contrasenia = document.getElementById("txt-password").value;
        const rolSeleccionado = document.getElementById("select-rol").value; // Envía ej: "Administrador", "Cajero"

        if (!rolSeleccionado) {
            mostrarError("Por favor, seleccione un rol de la lista.");
            return;
        }

        fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, contrasenia, rol: rolSeleccionado })
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => { throw new Error(err.message || "Credenciales o rol incorrectos."); });
            }
            return res.json();
        })
        .then(data => {
            if (data.success) {
                localStorage.setItem("usuario_sesion", JSON.stringify(data.usuario));

                // Evaluamos el nombre exacto del rol que viene de la base de datos
                switch (rolSeleccionado) {
                    case "Encargado_Almacen":
                    case "Encargado Almacen":
                    case "EA":
                        alert(`[Acceso Concedido] Bienvenido ${data.usuario.nombres}. Redirigiendo a Gestión de Compras...`);
                        window.location.href = "generar-orden.html";
                        break;

                    case "Cajero":
                    case "C":
                        alert(`[Acceso Concedido] Bienvenido ${data.usuario.nombres}. Redirigiendo a Apertura de Caja...`);
                        window.location.href = "aperturar-caja.html";
                        break;

                    case "Supervisor":
                    case "Supervisor_Caja":
                    case "SC":
                        alert(`[Acceso Concedido] Bienvenido Supervisor ${data.usuario.nombres}. Redirigiendo a Panel de Auditoría...`);
                        window.location.href = "consultar-movimientos.html";
                        break;

                    case "Administrador":
                    case "Programador":
                    case "EP":
                        alert(`[Acceso Concedido] Bienvenido ${data.usuario.nombres}. Redirigiendo a Catálogo de Cartelera...`);
                        window.location.href = "mantener-peliculas.html";
                        break;

                    default:
                        // Redirección por defecto para roles dinámicos o no especificados en el switch
                        alert(`[Acceso Concedido] Bienvenido ${data.usuario.nombres}.`);
                        window.location.href = "mantener-peliculas.html";
                }
            }
        })
        .catch(err => {
            mostrarError(err.message || "Error de conexión con el servidor.");
        });
    });

    function mostrarError(mensaje) {
        errorMsg.innerText = mensaje;
        alertError.classList.remove("hidden");
    }
});