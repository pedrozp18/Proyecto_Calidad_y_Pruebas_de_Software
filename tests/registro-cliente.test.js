const request = require('supertest');
const { app, db } = require('../server');

// Limpieza después de cada prueba
afterEach((done) => {
    db.query("DELETE FROM cliente WHERE correo LIKE '%@email.com%' OR dni = '73920184'", (err) => {
        if (err) return done(err);
        done();
    });
});

// Cerrar conexión al finalizar todas las pruebas para que Jest no se quede colgado
afterAll((done) => {
    db.end((err) => {
        if (err) return done(err);
        done();
    });
});
describe('Pruebas Unitarias - Módulo Registrar Cliente (CINE_DA)', () => {

    // Objeto base con datos válidos para reutilizar en cada prueba
    const clienteBase = {
        nombres: 'Pedro Emmanuel',
        apellidoPaterno: 'Zapata',
        apellidoMaterno: 'Paz',
        correo: 'pedro.zapata@email.com',
        dni: '73920184',
        password: 'Password123!'
    };


    // 1. CAMINO FELIZ (REGISTRO EXITOSO)

    describe('Flujo Correcto', () => {
        test('Debería registrar un cliente exitosamente si todos los datos son válidos', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send(clienteBase);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message');
            expect(res.body.success).toBe(true);
        });
    });

    // 2. PRUEBAS PARA EL CAMPO: NOMBRES

    describe('Campo: Nombres', () => {
        test('Debería rechazar si el campo nombres está vacío', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, nombres: '' });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBeDefined();
        });

        test('Debería rechazar si el campo nombres solo contiene espacios en blanco', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, nombres: '    ' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si nombres excede los 100 caracteres', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, nombres: 'A'.repeat(101) });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si nombres contiene números o caracteres especiales no permitidos', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, nombres: 'Pedro123' });

            expect(res.statusCode).toBe(400);
        });
    });

    // 3. PRUEBAS PARA EL CAMPO: APELLIDO PATERNO

    describe('Campo: Apellido Paterno', () => {
        test('Debería rechazar si apellidoPaterno está vacío', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, apellidoPaterno: '' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si apellidoPaterno solo contiene espacios en blanco', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, apellidoPaterno: '   ' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si apellidoPaterno excede los 100 caracteres', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, apellidoPaterno: 'B'.repeat(101) });

            expect(res.statusCode).toBe(400);
        });
    });

    // 4. PRUEBAS PARA EL CAMPO: APELLIDO MATERNO

    describe('Campo: Apellido Materno', () => {
        test('Debería rechazar si apellidoMaterno está vacío', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, apellidoMaterno: '' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si apellidoMaterno solo contiene espacios en blanco', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, apellidoMaterno: '   ' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si apellidoMaterno excede los 100 caracteres', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, apellidoMaterno: 'C'.repeat(101) });

            expect(res.statusCode).toBe(400);
        });
    });

    // 5. PRUEBAS PARA EL CAMPO: DNI

    describe('Campo: DNI', () => {
        test('Debería rechazar si el DNI está vacío', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, dni: '' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si el DNI tiene menos de 8 dígitos', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, dni: '1234567' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si el DNI tiene más de 8 dígitos', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, dni: '123456789' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si el DNI contiene letras o caracteres no numéricos', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, dni: '7392018A' });

            expect(res.statusCode).toBe(400);
        });
        test('Debería rechazar el registro si el DNI ya se encuentra registrado en la base de datos', async () => {
    const dniDuplicado = '73920184';

    // 1. Primer registro (exitoso o prerrequisito)
    await request(app)
        .post('/api/cliente/registro')
        .send({
            ...clienteBase,
            correo: 'primer.cliente@email.com',
            dni: dniDuplicado
        });

    // 2. Intentar registrar un segundo cliente con el mismo DNI
    const res = await request(app)
        .post('/api/cliente/registro')
        .send({
            ...clienteBase,
            correo: 'segundo.cliente@email.com', // Correo diferente para probar solo el conflicto de DNI
            dni: dniDuplicado
        });

    // 3. Verificaciones
    expect(res.statusCode).toBe(400); // o 409 si usas Conflict en Express
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/registrado|duplicado|existe/i);
});
    });

    // 6. PRUEBAS PARA EL CAMPO: CORREO ELECTRÓNICO

    describe('Campo: Correo Electrónico', () => {
        test('Debería rechazar si el correo está vacío', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, correo: '' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si el correo no tiene un arroba (@)', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, correo: 'pedro.zapatagmail.com' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si el correo no tiene dominio o extensión válida', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, correo: 'pedro@gmail' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si el correo contiene espacios', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, correo: 'pedro zapata@gmail.com' });

            expect(res.statusCode).toBe(400);
        });
    });

    // ==========================================
    // 7. PRUEBAS PARA EL CAMPO: CONTRASEÑA
    // ==========================================
    describe('Campo: Contraseña', () => {
        test('Debería rechazar si la contraseña está vacía', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, password: '' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si la contraseña es menor a 8 caracteres', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, password: 'Pass1!' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si no contiene al menos una mayúscula', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, password: 'password123!' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si no contiene al menos un número', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, password: 'Password!' });

            expect(res.statusCode).toBe(400);
        });

        test('Debería rechazar si no contiene caracteres especiales', async () => {
            const res = await request(app)
                .post('/api/cliente/registro')
                .send({ ...clienteBase, password: 'Password123' });

            expect(res.statusCode).toBe(400);
        });
    });

});