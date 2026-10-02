/**
 * js/cerrar-caja.js
 * Lógica transaccional para el CU: Arqueo y Cierre de Caja
 * Sincronizado con MySQL y LocalStorage
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Verificar precondición (Debe haber una caja abierta en el LocalStorage)
    const cajaData = JSON.parse(localStorage.getItem("caja_activa"));
    if (!cajaData || cajaData.estado !== "Abierta") {
        alert("[ALERTA] No se encuentra ninguna sesión de caja abierta para cerrar.");
        window.location.href = "aperturar-caja.html";
        return;
    }

    // Renderizar cabeceras básicas
    const elCajeroNav = document.getElementById("lbl-cajero-nav");
    if (elCajeroNav && cajaData.cajeroAsignado) {
        elCajeroNav.innerText = "Operador: " + cajaData.cajeroAsignado.split(' ')[0];
    }
    const elCajaActiva = document.getElementById("lbl-caja-activa");
    if (elCajaActiva) {
        elCajaActiva.innerHTML = `<i class="fa-solid fa-cash-register"></i> ${cajaData.numeroCajaFisica} | Activa`;
    }

    let saldoEsperadoGlobal = 0;

    // 2. Cargar en tiempo real el balance desde MySQL
    fetch(`http://localhost:3000/api/cajas/resumen/${cajaData.idSesionCaja}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) throw new Error(data.error);

            saldoEsperadoGlobal = data.saldoEsperado;

            // Inyectar valores económicos en los elementos del panel izquierdo
            document.getElementById("txt-resumen-apertura").innerText = "S/ " + data.montoApertura.toFixed(2);
            document.getElementById("txt-resumen-ventas").innerText = "S/ " + data.totalVentas.toFixed(2);
            document.getElementById("txt-saldo-esperado").innerText = "S/ " + data.saldoEsperado.toFixed(2);
        })
        .catch(err => {
            console.error(err);
            alert("Error al cargar el resumen financiero desde el servidor.");
        });

    // 3. Enviar el Arqueo al hacer Submit al Formulario
    const formCierre = document.getElementById("form-cierre");
    if (formCierre) {
        formCierre.addEventListener("submit", (e) => {
            e.preventDefault();

            const montoCierreReal = parseFloat(document.getElementById("num-monto-real").value);
            const observaciones = document.getElementById("txt-observaciones").value.trim();

            if (isNaN(montoCierreReal)) {
                alert("Por favor, ingrese un monto de conteo válido.");
                return;
            }

            // Confirmación formal de seguridad
            if (!confirm(`¿Está seguro de proceder con el cierre?\nSaldo Esperado: S/ ${saldoEsperadoGlobal.toFixed(2)}\nEfectivo Contado: S/ ${montoCierreReal.toFixed(2)}`)) {
                return;
            }

            const payload = {
                idSesionCaja: cajaData.idSesionCaja,
                montoCierreReal: montoCierreReal,
                saldoEsperado: saldoEsperadoGlobal,
                observaciones: observaciones
            };

            // Enviar la auditoría final al backend
            fetch('http://localhost:3000/api/cajas/cerrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => {
                if (!res.ok) throw new Error("Error interno al procesar el cuadre.");
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    // Calcular el mensaje de auditoría
                    let msgAuditoria = "";
                    if (data.diferencia === 0) {
                        msgAuditoria = "✔ ¡CAJA CUADRADA A LA PERFECCIÓN! Sin diferencias.";
                    } else if (data.diferencia > 0) {
                        msgAuditoria = `⚠ SOBRANTE DETECTADO: S/ ${data.diferencia.toFixed(2)} registrados en la auditoría.`;
                    } else {
                        msgAuditoria = `🚨 FALTANTE DETECTADO: S/ ${Math.abs(data.diferencia).toFixed(2)} bajo responsabilidad del cajero.`;
                    }

                    alert(`[CIERRE DE TURNO CONSOLIDADO]\n\n${msgAuditoria}\nSesión finalizada con éxito.`);
                    
                    // Limpiar el LocalStorage para cumplir con las precondiciones del sistema
                    localStorage.removeItem("caja_activa");

                    // Redirigir a la pantalla de login o inicio
                    window.location.href = "aperturar-caja.html";
                }
            })
            .catch(err => {
                console.error(err);
                alert("Error de Servidor (MySQL):\n" + err.message);
            });
        });
    }
});