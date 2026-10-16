// Importamos las funciones de validación oficiales desde el server.js
const { 
    validarNombres, 
    validarApellidoPaterno, 
    validarApellidoMaterno, 
    validarDni, 
    validarCorreo, 
    validarPassword 
} = require('../server');

describe('Pruebas Unitarias Estrictas - Módulo Registro de Clientes (REQ-REG-001)', () => {

    // ==========================================
    // CAMPO 1: NOMBRES (TC-001 al TC-008)
    // ==========================================
    describe('Campo: Nombres', () => {
        test('TC-001: Debería aceptar un nombre válido', () => {
            expect(validarNombres('Pedro Emmanuel')).toBe(true);
        });
        test('TC-002: Debería aceptar longitud mínima de 2 caracteres', () => {
            expect(validarNombres('Jo')).toBe(true);
        });
        test('TC-003: Debería rechazar nombre menor a 2 caracteres', () => {
            expect(validarNombres('J')).toBe(false);
        });
        test('TC-004: Debería aceptar longitud máxima de 100 caracteres', () => {
            expect(validarNombres('A'.repeat(100))).toBe(true);
        });
        test('TC-005: Debería rechazar nombre mayor a 100 caracteres', () => {
            expect(validarNombres('A'.repeat(101))).toBe(false);
        });
        test('TC-006: Debería rechazar nombres que contengan números', () => {
            expect(validarNombres('Pedro123')).toBe(false);
        });
        test('TC-007: Debería rechazar caracteres especiales no permitidos', () => {
            expect(validarNombres('Pedro@')).toBe(false);
        });
        test('TC-008: Debería rechazar nombres vacíos o solo espacios', () => {
            expect(validarNombres('   ')).toBe(false);
        });
    });

    // ==========================================
    // CAMPO 2: APELLIDO PATERNO (TC-009 al TC-016)
    // ==========================================
    describe('Campo: Apellido Paterno', () => {
        test('TC-009: Debería aceptar un apellido paterno válido', () => {
            expect(validarApellidoPaterno('Zapata')).toBe(true);
        });
        test('TC-010: Debería aceptar longitud mínima de 2 caracteres', () => {
            expect(validarApellidoPaterno('Li')).toBe(true);
        });
        test('TC-011: Debería rechazar apellido paterno menor a 2 caracteres', () => {
            expect(validarApellidoPaterno('L')).toBe(false);
        });
        test('TC-012: Debería aceptar longitud máxima de 100 caracteres', () => {
            expect(validarApellidoPaterno('A'.repeat(100))).toBe(true);
        });
        test('TC-013: Debería rechazar apellido paterno mayor a 100 caracteres', () => {
            expect(validarApellidoPaterno('A'.repeat(101))).toBe(false);
        });
        test('TC-014: Debería rechazar apellido paterno con números', () => {
            expect(validarApellidoPaterno('Zapata123')).toBe(false);
        });
        test('TC-015: Debería rechazar caracteres especiales en apellido paterno', () => {
            expect(validarApellidoPaterno('Zapata#')).toBe(false);
        });
        test('TC-016: Debería rechazar apellido paterno vacío o con espacios', () => {
            expect(validarApellidoPaterno('')).toBe(false);
        });
    });

    // ==========================================
    // CAMPO 3: APELLIDO MATERNO (TC-017 al TC-024)
    // ==========================================
    describe('Campo: Apellido Materno', () => {
        test('TC-017: Debería aceptar un apellido materno válido', () => {
            expect(validarApellidoMaterno('Paz')).toBe(true);
        });
        test('TC-018: Debería aceptar longitud mínima de 2 caracteres', () => {
            expect(validarApellidoMaterno('Re')).toBe(true);
        });
        test('TC-019: Debería rechazar apellido materno menor a 2 caracteres', () => {
            expect(validarApellidoMaterno('R')).toBe(false);
        });
        test('TC-020: Debería aceptar longitud máxima de 100 caracteres', () => {
            expect(validarApellidoMaterno('A'.repeat(100))).toBe(true);
        });
        test('TC-021: Debería rechazar apellido materno mayor a 100 caracteres', () => {
            expect(validarApellidoMaterno('A'.repeat(101))).toBe(false);
        });
        test('TC-022: Debería rechazar apellido materno con números', () => {
            expect(validarApellidoMaterno('Paz99')).toBe(false);
        });
        test('TC-023: Debería rechazar caracteres especiales en apellido materno', () => {
            expect(validarApellidoMaterno('Paz$')).toBe(false);
        });
        test('TC-024: Debería rechazar apellido materno vacío o con espacios', () => {
            expect(validarApellidoMaterno('   ')).toBe(false);
        });
    });

    // ==========================================
    // CAMPO 4: DNI (TC-025 al TC-029)
    // ==========================================
    describe('Campo: DNI', () => {
        test('TC-025: Debería aceptar DNI con longitud exacta de 8 dígitos', () => {
            expect(validarDni('73920184')).toBe(true);
        });
        test('TC-026: Debería rechazar DNI menor a 8 dígitos', () => {
            expect(validarDni('7392018')).toBe(false);
        });
        test('TC-027: Debería rechazar DNI mayor a 8 dígitos', () => {
            expect(validarDni('739201845')).toBe(false);
        });
        test('TC-028: Debería rechazar DNI que contenga letras', () => {
            expect(validarDni('7392018A')).toBe(false);
        });
        test('TC-029: Debería rechazar DNI con signos negativos o símbolos', () => {
            expect(validarDni('-73920184')).toBe(false);
        });
    });

    // ==========================================
    // CAMPO 5: CORREO ELECTRÓNICO (TC-030 al TC-033)
    // ==========================================
    describe('Campo: Correo Electrónico', () => {
        test('TC-030: Debería aceptar estructura estándar de correo', () => {
            expect(validarCorreo('pedro.zapata@email.com')).toBe(true);
        });
        test('TC-031: Debería rechazar correo que carezca del símbolo @', () => {
            expect(validarCorreo('pedro.email.com')).toBe(false);
        });
        test('TC-032: Debería rechazar correo sin dominio o extensión', () => {
            expect(validarCorreo('pedro@email')).toBe(false);
        });
        test('TC-033: Debería rechazar correo con doble arroba o puntos consecutivos', () => {
            expect(validarCorreo('pedro@@email.com')).toBe(false);
        });
    });

    // ==========================================
    // CAMPO 6: PASSWORD / CONTRASEÑA (TC-034 al TC-037)
    // ==========================================
    describe('Campo: Contraseña / Password', () => {
        test('TC-034: Debería aceptar contraseña segura con letras, números y mayúsculas', () => {
            expect(validarPassword('Password123!')).toBe(true);
        });
        test('TC-035: Debería rechazar contraseñas menores a 8 caracteres', () => {
            expect(validarPassword('Pass1!')).toBe(false);
        });
        test('TC-036: Debería rechazar contraseñas sin números o letras mayúsculas', () => {
            expect(validarPassword('passwordsinmayus')).toBe(false);
        });
        test('TC-037: Debería rechazar contraseñas vacías', () => {
            expect(validarPassword('')).toBe(false);
        });
    });

});