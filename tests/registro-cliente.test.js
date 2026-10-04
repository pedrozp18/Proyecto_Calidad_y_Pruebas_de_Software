const request = require('supertest');
const app = require('../server'); // Importa tu app de Express

describe('Pruebas Unitarias e Integración - Registro de Cliente (CINE_D&A)', () => {

    // Test 1: Intento de registro con campos vacíos
    test('Debería retornar error 400 si faltan campos obligatorios', async () => {
        const response = await request(app)
            .post('/api/cliente/registro')
            .send({
                nombres: '',
                apellidoPaterno: 'Pérez',
                apellidoMaterno: 'Gómez',
                correo: 'test@gmail.com',
                dni: '12345678',
                password: 'Password123'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    // Test 2: Intento de registro con espacios en blanco (.trim())
    test('Debería retornar error 400 si los campos contienen solo espacios en blanco', async () => {
        const response = await request(app)
            .post('/api/cliente/registro')
            .send({
                nombres: '   ',
                apellidoPaterno: 'Pérez',
                apellidoMaterno: 'Gómez',
                correo: 'test@gmail.com',
                dni: '12345678',
                password: 'Password123'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain('no pueden contener solo espacios en blanco');
    });

    // Test 3: Validación de longitud máxima (> 100 caracteres)
    test('Debería retornar error 400 si el nombre supera los 100 caracteres', async () => {
        const nombreLargo = 'A'.repeat(101); // Cadena de 101 letras

        const response = await request(app)
            .post('/api/cliente/registro')
            .send({
                nombres: nombreLargo,
                apellidoPaterno: 'Pérez',
                apellidoMaterno: 'Gómez',
                correo: 'test@gmail.com',
                dni: '12345678',
                password: 'Password123'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Los campos de nombres y apellidos no pueden superar los 100 caracteres.');
    });

    // Test 4: Validación de contraseña débil
    test('Debería retornar error 400 si la contraseña no cumple la seguridad mínima', async () => {
        const response = await request(app)
            .post('/api/cliente/registro')
            .send({
                nombres: 'Juan',
                apellidoPaterno: 'Pérez',
                apellidoMaterno: 'Gómez',
                correo: 'juan@gmail.com',
                dni: '12345678',
                password: '123' // Contraseña débil
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toContain('La contraseña es débil');
    });

});