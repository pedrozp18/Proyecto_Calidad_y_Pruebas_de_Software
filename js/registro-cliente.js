document.addEventListener("DOMContentLoaded", () => {
    // Captura de inputs
    const inputNombres = document.getElementById("nombres");
    const inputApePaterno = document.getElementById("apellidoPaterno");
    const inputApeMaterno = document.getElementById("apellidoMaterno");
    const inputDni = document.getElementById("dni");
    const formRegistro = document.getElementById("form-registro") || document.getElementById("formRegistroCliente");
    const linkLogin = document.getElementById("linkLogin");

    // Función para permitir solo letras y espacios en campos de texto
    const soloLetras = (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    };

    // Restricción en tiempo real para Nombres y Apellidos
    if (inputNombres) inputNombres.addEventListener("input", soloLetras);
    if (inputApePaterno) inputApePaterno.addEventListener("input", soloLetras);
    if (inputApeMaterno) inputApeMaterno.addEventListener("input", soloLetras);

    // Restricción en tiempo real: DNI (Solo números y máximo 8 dígitos)
    if (inputDni) {
        inputDni.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8);
        });
    }

    // Validación y envío del formulario
    if (formRegistro) {
        formRegistro.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombres = inputNombres ? inputNombres.value.trim() : "";
            const apellidoPaterno = inputApePaterno ? inputApePaterno.value.trim() : "";
            const apellidoMaterno = inputApeMaterno ? inputApeMaterno.value.trim() : "";
            const correo = document.getElementById("correo").value.trim();
            const dni = inputDni ? inputDni.value.trim() : "";
            const password = document.getElementById("password").value;

            // Validaciones de longitud de nombres y apellidos
            if (nombres.length < 2) {
                alert("El campo Nombres debe contener al menos 2 letras.");
                return;
            }

            if (apellidoPaterno.length < 2) {
                alert("El Apellido Paterno debe contener al menos 2 letras.");
                return;
            }

            if (apellidoMaterno.length < 2) {
                alert("El Apellido Materno debe contener al menos 2 letras.");
                return;
            }

            // Validación de DNI
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
                    body: JSON.stringify({ 
                        nombres, 
                        apellidoPaterno, 
                        apellidoMaterno, 
                        correo, 
                        dni, 
                        password 
                    })
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
    }

    // =========================================================
    // 🚪 CONFIRMACIÓN DE SALIDA AL HACER CLIC EN "INICIA SESIÓN"
    // =========================================================
    if (linkLogin) {
        linkLogin.addEventListener("click", (e) => {
            const nombres = inputNombres ? inputNombres.value.trim() : "";
            const apePaterno = inputApePaterno ? inputApePaterno.value.trim() : "";
            const apeMaterno = inputApeMaterno ? inputApeMaterno.value.trim() : "";
            const correo = document.getElementById("correo") ? document.getElementById("correo").value.trim() : "";
            const dni = inputDni ? inputDni.value.trim() : "";
            const password = document.getElementById("password") ? document.getElementById("password").value : "";

            // Si hay datos en cualquiera de los campos, pide confirmación
            if (nombres || apePaterno || apeMaterno || correo || dni || password) {
                const confirmar = confirm("¿Estás seguro de que deseas salir? Se perderán los datos ingresados.");
                if (!confirmar) {
                    e.preventDefault(); // Cancela la redirección
                }
            }
        });
    }
});