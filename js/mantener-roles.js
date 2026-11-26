/**
 * js/mantener-roles.js
 * Gestión de Roles (Listar, Crear y Editar) para el Módulo Administrador
 */

document.addEventListener("DOMContentLoaded", () => {
    const formRol = document.getElementById("form-rol");
    const inputNombre = document.getElementById("nombre_rol");
    const inputDesc = document.getElementById("descripcion");
    const tbodyRoles = document.querySelector("#tabla-roles tbody");
    const btnSubmit = formRol ? formRol.querySelector('button[type="submit"]') : null;
    const btnCancelar = document.getElementById("btn-cancelar-edicion");

    let rolesCache = [];
    let idRolEditando = null;

    function limpiarModoEdicion() {
        idRolEditando = null;
        if (formRol) formRol.reset();
        if (btnSubmit) {
            btnSubmit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Rol';
        }
        if (btnCancelar) {
            btnCancelar.style.display = "none";
        }
    }

    function iniciarEdicion(rol) {
        const id = rol.idRol ?? rol.id;
        idRolEditando = id;

        if (inputNombre) inputNombre.value = rol.nombreRol ?? rol.nombre_rol ?? "";
        if (inputDesc) {
            const descActual = rol.descripcion ?? "";
            inputDesc.value = descActual === "-" ? "" : descActual;
        }

        if (btnSubmit) {
            btnSubmit.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Actualizar Rol';
        }
        if (btnCancelar) {
            btnCancelar.style.display = "inline-flex";
        }

        inputNombre?.focus();
    }

    async function cargarRoles() {
        if (!tbodyRoles) return;
        try {
            const res = await fetch("/api/roles");
            const roles = await res.json();
            rolesCache = Array.isArray(roles) ? roles : [];

            if (rolesCache.length === 0) {
                tbodyRoles.innerHTML = `<tr><td colspan="4">No hay roles registrados.</td></tr>`;
                return;
            }

            tbodyRoles.innerHTML = rolesCache.map(r => {
                const id = r.idRol ?? r.id ?? "";
                const nombre = r.nombreRol ?? r.nombre_rol ?? "";
                const desc = r.descripcion ?? "-";

                return `
                    <tr>
                        <td>${id}</td>
                        <td><strong>${nombre}</strong></td>
                        <td>${desc}</td>
                        <td>
                            <button type="button" class="btn btn-secondary btn-editar-rol" data-id="${id}" style="padding: 6px 12px; font-size: 0.82rem; cursor: pointer;">
                                <i class="fa-solid fa-pen"></i> Editar
                            </button>
                        </td>
                    </tr>
                `;
            }).join("");

            tbodyRoles.querySelectorAll(".btn-editar-rol").forEach(btn => {
                btn.addEventListener("click", () => {
                    const idBuscado = String(btn.dataset.id);
                    const rolEncontrado = rolesCache.find(item => String(item.idRol ?? item.id) === idBuscado);
                    if (rolEncontrado) {
                        iniciarEdicion(rolEncontrado);
                    }
                });
            });
        } catch (err) {
            console.error("Error cargando roles:", err);
            tbodyRoles.innerHTML = `<tr><td colspan="4">Error al cargar los roles.</td></tr>`;
        }
    }

    if (btnCancelar) {
        btnCancelar.addEventListener("click", limpiarModoEdicion);
    }

    if (formRol) {
        formRol.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nombreRol = inputNombre ? inputNombre.value.trim() : "";
            const descripcion = inputDesc ? inputDesc.value.trim() : "";

            if (!nombreRol || !descripcion) return;

            const esEdicion = idRolEditando !== null && idRolEditando !== "";
            const url = esEdicion ? `/api/roles/${idRolEditando}` : "/api/roles";
            const method = esEdicion ? "PUT" : "POST";

            try {
                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombreRol, descripcion })
                });
                const data = await res.json();

                if (!res.ok || data.success === false) {
                    throw new Error(data.message || data.error || "No se pudo guardar el rol.");
                }

                alert(esEdicion ? "Rol actualizado correctamente." : "Rol guardado correctamente.");
                limpiarModoEdicion();
                cargarRoles();
            } catch (err) {
                alert("Error al procesar el rol: " + err.message);
            }
        });
    }

    cargarRoles();
});