document.addEventListener('DOMContentLoaded', cargarRoles);

async function cargarRoles() {
    try {
        const res = await fetch('/api/roles');
        const roles = await res.json();
        const tbody = document.querySelector('#tabla-roles tbody');
        
        if (!tbody) return; // Validación por si no existe la tabla en esa vista
        
        tbody.innerHTML = '';
        
        roles.forEach(r => {
            tbody.innerHTML += `
                <tr>
                    <td>${r.idRol}</td>
                    <td>${r.nombreRol}</td>
                    <td>${r.descripcion || ''}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error al cargar roles:', error);
    }
}

const formRol = document.getElementById('form-rol');
if (formRol) {
    formRol.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Mapear exactamente con los campos que espera la base de datos / backend
        const nombreRol = document.getElementById('nombre_rol').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();

        try {
            const response = await fetch('/api/roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombreRol, descripcion }) // Usar 'nombreRol'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                formRol.reset();
                cargarRoles(); // Recargar la tabla automáticamente
            } else {
                alert(data.error || 'Error al registrar el rol.');
            }
        } catch (error) {
            console.error('Error al guardar el rol:', error);
            alert('Error de conexión con el servidor.');
        }
    });
}