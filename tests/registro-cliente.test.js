// Funciones puras de validación de entrada
const validarTexto = (texto) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(texto) && texto.trim().length > 0;
const validarDni = (dni) => /^\d{8}$/.test(dni);
const validarCorreo = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
const validarPassword = (pass) => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pass);

describe('Pruebas Unitarias - Validación Exhaustiva y Casos Límite (REQ-REG-001)', () => {

    describe('Campo: Nombres y Apellidos', () => {
        test('TC-001: Debería retornar true si el texto contiene solo letras y tildes/espacios', () => {
            expect(validarTexto('Pedro Emmanuel')).toBe(true);
            expect(validarTexto('María José')).toBe(true);
        });

        test('TC-002: Debería retornar false si el texto contiene números', () => {
            expect(validarTexto('Pedro123')).toBe(false);
        });

        test('TC-003: Debería retornar false si el texto contiene caracteres especiales no permitidos', () => {
            expect(validarTexto('Pedro@')).toBe(false);
            expect(validarTexto('Ana-Sofía')).toBe(false);
        });

        test('TC-004: Debería retornar false si el campo está vacío', () => {
            expect(validarTexto('')).toBe(false);
        });

        test('TC-015: Debería retornar false si el texto contiene únicamente espacios en blanco', () => {
            expect(validarTexto('   ')).toBe(false);
        });
    });

    describe('Campo: DNI', () => {
        test('TC-005: Debería retornar true si el DNI tiene exactamente 8 dígitos numéricos', () => {
            expect(validarDni('73920184')).toBe(true);
        });

        test('TC-006: Debería retornar false si el DNI tiene menos de 8 dígitos', () => {
            expect(validarDni('7392018')).toBe(false);
        });

        test('TC-007: Debería retornar false si el DNI tiene más de 8 dígitos', () => {
            expect(validarDni('739201845')).toBe(false);
        });

        test('TC-008: Debería retornar false si el DNI contiene letras', () => {
            expect(validarDni('7392018A')).toBe(false);
        });

        test('TC-016: Debería retornar false si el DNI contiene signos negativos o símbolos', () => {
            expect(validarDni('-73920184')).toBe(false);
        });
    });

    describe('Campo: Correo Electrónico', () => {
        test('TC-009: Debería retornar true si el correo posee una estructura estándar válida', () => {
            expect(validarCorreo('pedro.zapata@email.com')).toBe(true);
        });

        test('TC-010: Debería retornar false si el correo carece del símbolo @', () => {
            expect(validarCorreo('pedro.email.com')).toBe(false);
        });

        test('TC-011: Debería retornar false si el correo carece de dominio o extensión', () => {
            expect(validarCorreo('pedro@email')).toBe(false);
            expect(validarCorreo('pedro@.com')).toBe(false);
        });

        test('TC-017: Debería retornar false si el correo contiene doble arroba o puntos consecutivos', () => {
            expect(validarCorreo('pedro@@email.com')).toBe(false);
            expect(validarCorreo('pedro..zapata@email.com')).toBe(false);
        });
    });

    describe('Campo: Contraseña / Password', () => {
        test('TC-012: Debería retornar true si la contraseña cumple con los criterios de seguridad', () => {
            expect(validarPassword('Password123!')).toBe(true);
        });

        test('TC-013: Debería retornar false si la contraseña es menor a 8 caracteres', () => {
            expect(validarPassword('Pass1!')).toBe(false);
        });

        test('TC-014: Debería retornar false si la contraseña no incluye caracteres especiales o números', () => {
            expect(validarPassword('PasswordSinNumeros')).toBe(false);
            expect(validarPassword('12345678')).toBe(false);
        });

        test('TC-018: Debería retornar false si la contraseña contiene espacios en blanco', () => {
            expect(validarPassword('Password 123!')).toBe(false);
        });
    });
});