document.addEventListener("DOMContentLoaded", () => {
    const inputNombre = document.getElementById("nombre");
    const inputDni = document.getElementById("dni");
    const formRegistro = document.getElementById("form-registro") || document.getElementById("formRegistroCliente");

    // Restricción en tiempo real: Nombre (Solo letras y espacios)
    inputNombre.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    });

    // Restricción en tiempo real: DNI (Solo números y máximo 8 dígitos)
    inputDni.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8);
    });

    // Validación al enviar el formulario
    formRegistro.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = inputNombre.value.trim();
        const correo = document.getElementById("correo").value.trim();
        const dni = inputDni.value.trim();
        const password = document.getElementById("password").value;

        // Validaciones previas
        if (nombre.length < 2) {
            alert("El nombre debe contener al menos 2 letras.");
            return;
        }

        if (dni.length !== 8) {
            alert("El DNI debe contener exactamente 8 dígitos numéricos.");
            return;
        }

        // =========================================================
        // Requisitos mínimos de la contraseña
        // =========================================================
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!passwordRegex.test(password)) {
            alert("La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número.");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/api/cliente/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, correo, dni, password })
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message || "¡Registro exitoso!");
                window.location.href = "login-cliente.html";
            } else {
                alert(data.error || "Ocurrió un error al intentar registrar la cuenta.");
            }
        } catch (error) {
            console.error("Error al registrar cliente:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });

    document.getElementById("linkLogin").addEventListener("click", (e) => {
    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const dni = document.getElementById("dni").value;
    const password = document.getElementById("password").value;

    // Si hay datos escritos, pide confirmación
    if (nombre || correo||dni||password) {
        const confirmar = confirm("¿Estás seguro de que deseas salir? Se perderán los datos ingresados.");
        if (!confirmar) {
            e.preventDefault(); // Cancela la redirección
        }
    }
});
});