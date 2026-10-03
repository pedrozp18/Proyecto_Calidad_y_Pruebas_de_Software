document.getElementById('btnLogin').addEventListener('click', async () => {
    const correoInput = document.getElementById('correo');
    const passwordInput = document.getElementById('password');

    // Validar que los inputs existan en el DOM
    if (!correoInput || !passwordInput) {
        console.error("No se encontraron los campos de correo o contraseña en el HTML.");
        return;
    }

    const correo = correoInput.value.trim();
    const password = passwordInput.value;

    if (!correo || !password) {
        alert("Por favor, ingresa tu correo y contraseña.");
        return;
    }

    try {
        const response = await fetch('/api/cliente/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert("¡Login correcto!");
            // Redirige a la vista correspondiente
            window.location.href = 'catalogo-cliente.html'; 
        } else {
            alert(data.error || "Credenciales incorrectas.");
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("Error de conexión con el servidor.");
    }
});