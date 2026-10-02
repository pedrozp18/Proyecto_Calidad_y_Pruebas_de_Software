/**
 * js/aperturar-caja.js
 * Lógica para el CU: Aperturar Caja (Conectado a MySQL)
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Recuperar el usuario logueado en la sesión activa del sistema
    const usuarioSesion = JSON.parse(localStorage.getItem("usuario_sesion"));
    
    if (!usuarioSesion) {
        alert("[ALERTA] No se ha detectado una sesión válida. Por favor, inicie sesión.");
        window.location.href = "index.html";
        return;
    }

    const txtFecha = document.getElementById("txt-fecha-apertura");
    const formApertura = document.getElementById("form-apertura");

    // Seteo en tiempo real de la previsualización de la hora del sistema
    const horaSistema = new Date();
    txtFecha.value = horaSistema.toLocaleString('es-PE', { hour12: false });

    // 2. Control de precondición: Validar que el cajero no tenga una caja abierta en MySQL
    fetch(`http://localhost:3000/api/cajas/activa/${usuarioSesion.idUsuario}`)
        .then(res => res.json())
        .then(data => {
            if (data.tieneCajaActiva) {
                alert(`[INFORME] Usted ya cuenta con una sesión activa (${data.caja.numeroCajaFisica}) en el sistema.\nRedirigiendo automáticamente a la pantalla de ventas.`);
                
                // Conservamos en LocalStorage la referencia de la caja activa para que los módulos la consuman
                const estadoCaja = {
                    idSesionCaja: data.caja.idSesionCaja,
                    numeroCajaFisica: data.caja.numeroCajaFisica,
                    montoApertura: parseFloat(data.caja.montoApertura),
                    saldoActual: parseFloat(data.caja.montoApertura), // El saldo real se actualizará con las ventas
                    cajeroAsignado: `${usuarioSesion.nombres} ${usuarioSesion.apellidos}`,
                    estado: "Abierta"
                };
                localStorage.setItem("caja_activa", JSON.stringify(estadoCaja));
                window.location.href = "venta-presencial.html";
            }
        })
        .catch(err => console.error("Error al validar estado de caja:", err));


    // 3. Flujo Principal: Procesar Formulario de Apertura
    formApertura.addEventListener("submit", (e) => {
        e.preventDefault();

        const cajaSeleccionadaText = document.getElementById("select-num-caja").value; // Ej: "CAJA-01"
        const montoInicial = parseFloat(document.getElementById("num-monto-inicial").value);

        // Extraer solo el número entero del select (ej. "CAJA-01" -> 1) para guardar en la BD
        const numeroCajaFisica = parseInt(cajaSeleccionadaText.replace("CAJA-", ""));

        // Regla de consistencia: El fondo de sencillo no puede ser negativo
        if (isNaN(montoInicial) || montoInicial < 0) {
            alert("Datos no válidos. El monto de apertura debe ser igual o mayor a cero.");
            return;
        }

        const payload = {
            idUsuario: usuarioSesion.idUsuario,
            numeroCajaFisica: numeroCajaFisica,
            montoApertura: montoInicial
        };

        // Enviar la transacción al servidor local
        fetch('http://localhost:3000/api/cajas/apertura', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error("Error en el servidor al registrar la apertura.");
            return res.json();
        })
        .then(data => {
            if (data.success) {
                // Sincronizar el LocalStorage local con el ID autogenerado de la BD para que "venta-presencial.js" pueda usarlo
                const estadoCaja = {
                    idSesionCaja: data.idSesionCaja,
                    numeroCajaFisica: cajaSeleccionadaText,
                    montoApertura: montoInicial,
                    saldoActual: montoInicial,
                    cajeroAsignado: `${usuarioSesion.nombres} ${usuarioSesion.apellidos}`,
                    estado: "Abierta"
                };
                localStorage.setItem("caja_activa", JSON.stringify(estadoCaja));

                alert(`[OPERACIÓN EXITOSA]\n${cajaSeleccionadaText} inicializada correctamente en MySQL.\nRedirigiendo a la pantalla de venta presencial...`);
                window.location.href = "venta-presencial.html";
            }
        })
        .catch(err => {
            alert("Error al aperturar caja: " + err.message);
        });
    });
});