document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-login-cliente");

    if (!form) {
        alert("ERROR: No se encontró el formulario 'form-login-cliente' en el HTML.");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Evita recargar la página

        const correo = document.getElementById("correo").value.trim();
        const password = document.getElementById("password").value;

        // Prueba inmediata en pantalla
        alert("Enviando petición a backend...");

        try {
            const res = await fetch("/api/cliente/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                localStorage.setItem("cliente_sesion", JSON.stringify(data.cliente));
                alert("¡Login correcto! Redirigiendo...");
                window.location.href = "catalogo-cliente.html";
            } else {
                alert(data.error || "Credenciales incorrectas.");
            }
        } catch (err) {
            alert("Error de conexión: " + err.message);
        }
    });
});