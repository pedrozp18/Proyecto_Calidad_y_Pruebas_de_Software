const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

async function probarRegistroCliente() {
    // Inicializar el navegador (Chrome)
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // 1. Navegar a la página de registro
        await driver.get('http://localhost:3000/registro-cliente.html');

        // 2. Ingresar datos de prueba válidos
        await driver.findElement(By.id('nombres')).sendKeys('Pedro Emmanuel');
        await driver.findElement(By.id('apellidoPaterno')).sendKeys('Zapata');
        await driver.findElement(By.id('apellidoMaterno')).sendKeys('Paz');
        await driver.findElement(By.id('correo')).sendKeys('pedro.zapata@email.com');
        await driver.findElement(By.id('dni')).sendKeys('73920184');
        await driver.findElement(By.id('password')).sendKeys('Password123!');

        // 3. Hacer clic en el botón de enviar formulario
        await driver.findElement(By.id('formRegistroCliente')).submit();

        // 4. Esperar la alerta o el cambio de URL (Resultado esperado)
        // Nota: Selenium maneja las alertas nativas de JavaScript con alert.getText()
        await driver.wait(until.alertIsPresent(), 5000);
        let alert = await driver.switchTo().alert();
        let alertText = await alert.getText();
        
        console.log("Texto de la alerta capturado:", alertText);
        assert(alertText.includes('¡Cliente registrado con éxito!'));
        
        await alert.accept(); // Cerrar la alerta
        console.log("Prueba funcional automatizada PASÓ con éxito.");

    } finally {
        // Cerrar el navegador
        await driver.quit();
    }
}

probarRegistroCliente();