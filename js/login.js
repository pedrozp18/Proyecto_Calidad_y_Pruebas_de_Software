/**
 * js/login.js
 * Lógica de negocio para el Caso de Uso: Validar Credenciales (Conectado a MySQL)
 */

async function cargarSelectRoles() {
    try {
        const select = document.getElementById('select-rol') || document.querySelector('select');
        if (!select) return;

        const res = await fetch('/api/roles');
        const roles = await res.json();

        select.innerHTML = '<option value="">-- Seleccione su Rol Asignado --</option>';

        roles.forEach(r => {
            select.innerHTML += `<option value="${r.nombreRol}" data-id-rol="${r.idRol}">${r.nombreRol}</option>`;
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

    if (!formLogin) return;

    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        if (alertError) alertError.classList.add("hidden");

        const usuario = document.getElementById("txt-usuario").value.trim();
        const contrasenia = document.getElementById("txt-password").value;
        const selectRol = document.getElementById("select-rol");
        const rolSeleccionado = selectRol ? selectRol.value : "";

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
                return res.json().then(err => {
                    throw new Error(err.message || "Credenciales o rol incorrectos.");
                });
            }
            return res.json();
        })
        .then(data => {
            if (data.success) {
                localStorage.setItem("usuario_sesion", JSON.stringify(data.usuario));

                const idRol = Number(data.usuario?.idRol ?? data.idRol ?? 0);
                const nombre = data.usuario?.nombres || usuario;

                // Administrador (idRol 1 o "Administrador") y Supervisor van a consultar-movimientos.html
                if (idRol === 1 || ["Administrador", "Supervisor", "Supervisor_Caja", "SC"].includes(rolSeleccionado)) {
                    alert(`[Acceso Concedido] Bienvenido ${nombre}. Redirigiendo a Historial de Movimientos...`);
                    window.location.href = "consultar-movimientos.html";
                    return;
                }

                switch (rolSeleccionado) {
                    case "Encargado_Almacen":
                    case "Encargado Almacen":
                    case "EA":
                        alert(`[Acceso Concedido] Bienvenido ${nombre}. Redirigiendo a Gestión de Compras...`);
                        window.location.href = "generar-orden.html";
                        break;

                    case "Cajero":
                    case "C":
                        alert(`[Acceso Concedido] Bienvenido ${nombre}. Redirigiendo a Apertura de Caja...`);
                        window.location.href = "aperturar-caja.html";
                        break;

                    case "Programador":
                    case "EP":
                        alert(`[Acceso Concedido] Bienvenido ${nombre}. Redirigiendo a Catálogo de Cartelera...`);
                        window.location.href = "mantener-peliculas.html";
                        break;

                    default:
                        alert(`[Acceso Concedido] Bienvenido ${nombre}.`);
                        window.location.href = "consultar-movimientos.html";
                }
            }
        })
        .catch(err => {
            mostrarError(err.message || "Error de conexión con el servidor.");
        });
    });

    function mostrarError(mensaje) {
        if (errorMsg) errorMsg.innerText = mensaje;
        if (alertError) alertError.classList.remove("hidden");
    }
});