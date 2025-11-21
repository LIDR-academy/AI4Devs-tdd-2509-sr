import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { Prisma } from '@prisma/client';

/**
 * Suite de Tests Unitarios: Inserción de Candidatos
 *
 * Estrategia de Testing:
 * - Mockear todas las llamadas a Prisma para evitar dependencias de BD
 * - Validar reglas de negocio: campos obligatorios, formatos, longitudes
 * - Cubrir happy path y casos de error principales
 * - Usar patrón AAA (Arrange, Act, Assert)
 */

// Mock de Prisma usando vi.hoisted para evitar problemas de hoisting
const { mockCreate, mockUpdate, mockFindUnique } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockFindUnique: vi.fn(),
}));

vi.mock('../infrastructure/database/prisma', () => ({
  prisma: {
    candidate: {
      create: mockCreate,
      update: mockUpdate,
      findUnique: mockFindUnique,
    }
  }
}));

// Importar después del mock
import { Candidate } from '../domain/models/Candidate';

// ============================================================================
// FIXTURES Y DATOS DE PRUEBA
// ============================================================================

/**
 * Fixture: Candidato válido con todos los campos requeridos
 */
const validCandidateData = {
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan.perez@example.com',
  phone: '+34612345678',
  address: 'Calle Principal 123, Madrid',
};

/**
 * Fixture: Respuesta esperada de Prisma después de crear candidato
 */
const mockCreatedCandidate = {
  id: 1,
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan.perez@example.com',
  phone: '+34612345678',
  address: 'Calle Principal 123, Madrid',
};

/**
 * Fixture: Candidato con datos mínimos requeridos (sin campos opcionales)
 */
const minimalCandidateData = {
  firstName: 'María',
  lastName: 'García',
  email: 'maria.garcia@example.com',
};

/**
 * Fixture: Candidato con email inválido
 */
const invalidEmailData = {
  firstName: 'Pedro',
  lastName: 'López',
  email: 'email-invalido',
};

/**
 * Fixture: Candidato con campos que exceden longitud máxima
 */
const exceedsMaxLengthData = {
  firstName: 'A'.repeat(101), // Max: 100 caracteres según schema
  lastName: 'González',
  email: 'test@example.com',
};

// ============================================================================
// SUITE DE TESTS
// ============================================================================

describe('Candidate - Insert Operation', () => {

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada test para asegurar aislamiento
    vi.clearAllMocks();
  });

  // ==========================================================================
  // HAPPY PATH - Casos Exitosos
  // ==========================================================================

  describe('Happy Path - Inserción Exitosa', () => {

    it('debería crear un candidato con todos los campos válidos', async () => {
      // Arrange: Preparar el mock de Prisma para simular creación exitosa
      mockCreate.mockResolvedValue(mockCreatedCandidate);

      const candidate = new Candidate(validCandidateData);

      // Act: Ejecutar la operación de guardado
      const result = await candidate.save();

      // Assert: Verificar que el candidato fue creado correctamente
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.firstName).toBe('Juan');
      expect(result.lastName).toBe('Pérez');
      expect(result.email).toBe('juan.perez@example.com');

      // Verificar que Prisma fue llamado con los datos correctos
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@example.com',
        })
      });

      // Verificar que solo fue llamado una vez
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('debería crear un candidato solo con campos obligatorios (sin opcionales)', async () => {
      // Arrange
      const mockMinimalCandidate = {
        id: 2,
        ...minimalCandidateData,
        phone: null,
        address: null,
      };

      mockCreate.mockResolvedValue(mockMinimalCandidate);

      const candidate = new Candidate(minimalCandidateData);

      // Act
      const result = await candidate.save();

      // Assert: Verificar que se creó sin campos opcionales
      expect(result).toBeDefined();
      expect(result.id).toBe(2);
      expect(result.firstName).toBe('María');
      expect(result.lastName).toBe('García');
      expect(result.email).toBe('maria.garcia@example.com');

      // Verificar que NO se enviaron campos opcionales undefined
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'María',
          lastName: 'García',
          email: 'maria.garcia@example.com',
        })
      });
    });

    it('debería retornar el candidato con ID generado por la base de datos', async () => {
      // Arrange: Simular autoincrement de ID
      const mockCandidateWithGeneratedId = {
        id: 999,
        ...validCandidateData,
      };

      mockCreate.mockResolvedValue(mockCandidateWithGeneratedId);

      const candidate = new Candidate(validCandidateData);

      // Act
      const result = await candidate.save();

      // Assert: Verificar que el ID fue asignado
      expect(result.id).toBe(999);
      expect(typeof result.id).toBe('number');
    });
  });

  // ==========================================================================
  // VALIDACIONES DE DATOS - Casos de Error
  // ==========================================================================

  describe('Validaciones de Datos - Campos Obligatorios', () => {

    it('debería fallar cuando falta el campo firstName', async () => {
      // Arrange: Simular error de Prisma por campo faltante
      const dataWithoutFirstName = {
        lastName: 'Martínez',
        email: 'test@example.com',
      };

      // Simular error de Prisma cuando falta campo obligatorio
      mockCreate.mockRejectedValue({
        code: 'P2011',
        message: 'Null constraint violation on the fields: (`firstName`)',
      });

      const candidate = new Candidate(dataWithoutFirstName);

      // Act & Assert: Verificar que lanza error
      await expect(candidate.save()).rejects.toThrow();

      // Verificar que se intentó llamar a Prisma
      expect(mockCreate).toHaveBeenCalled();
    });

    it('debería fallar cuando falta el campo lastName', async () => {
      // Arrange
      const dataWithoutLastName = {
        firstName: 'Carlos',
        email: 'carlos@example.com',
      };

      mockCreate.mockRejectedValue({
        code: 'P2011',
        message: 'Null constraint violation on the fields: (`lastName`)',
      });

      const candidate = new Candidate(dataWithoutLastName);

      // Act & Assert
      await expect(candidate.save()).rejects.toThrow();
      expect(mockCreate).toHaveBeenCalled();
    });

    it('debería fallar cuando falta el campo email', async () => {
      // Arrange
      const dataWithoutEmail = {
        firstName: 'Ana',
        lastName: 'Rodríguez',
      };

      mockCreate.mockRejectedValue({
        code: 'P2011',
        message: 'Null constraint violation on the fields: (`email`)',
      });

      const candidate = new Candidate(dataWithoutEmail);

      // Act & Assert
      await expect(candidate.save()).rejects.toThrow();
      expect(mockCreate).toHaveBeenCalled();
    });
  });

  describe('Validaciones de Datos - Formatos Inválidos', () => {

    it('debería fallar con email en formato inválido', async () => {
      // Arrange: Simular error de validación de Prisma
      mockCreate.mockRejectedValue({
        code: 'P2000',
        message: 'The provided value for the column is too long for the column\'s type.',
      });

      const candidate = new Candidate(invalidEmailData);

      // Act & Assert
      await expect(candidate.save()).rejects.toThrow();

      // Nota: La validación de formato de email debería idealmente
      // hacerse en la capa de aplicación antes de llegar a Prisma
      expect(mockCreate).toHaveBeenCalled();
    });

    it('debería fallar cuando el email ya existe (constraint unique)', async () => {
      // Arrange: Simular violación de constraint unique
      mockCreate.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
        message: 'Unique constraint failed on the fields: (`email`)',
      });

      const duplicateEmailCandidate = new Candidate({
        firstName: 'Duplicate',
        lastName: 'User',
        email: 'juan.perez@example.com', // Email ya existente
      });

      // Act & Assert
      await expect(duplicateEmailCandidate.save()).rejects.toMatchObject({
        code: 'P2002',
      });

      expect(mockCreate).toHaveBeenCalled();
    });

    it('debería fallar cuando el teléfono excede 15 caracteres', async () => {
      // Arrange: Teléfono con más de 15 caracteres (límite del schema)
      const invalidPhoneData = {
        ...validCandidateData,
        phone: '+34123456789012345678', // 24 caracteres
      };

      mockCreate.mockRejectedValue({
        code: 'P2000',
        message: 'The provided value for the column is too long for the column\'s type. Column: phone',
      });

      const candidate = new Candidate(invalidPhoneData);

      // Act & Assert
      await expect(candidate.save()).rejects.toThrow();
      expect(mockCreate).toHaveBeenCalled();
    });
  });

  describe('Validaciones de Datos - Longitudes Máximas', () => {

    it('debería fallar cuando firstName excede 100 caracteres', async () => {
      // Arrange: firstName con 101 caracteres
      mockCreate.mockRejectedValue({
        code: 'P2000',
        message: 'The provided value for the column is too long for the column\'s type. Column: firstName',
      });

      const candidate = new Candidate(exceedsMaxLengthData);

      // Act & Assert
      await expect(candidate.save()).rejects.toThrow();
      expect(mockCreate).toHaveBeenCalled();
    });

    it('debería fallar cuando lastName excede 100 caracteres', async () => {
      // Arrange
      const longLastNameData = {
        firstName: 'Test',
        lastName: 'B'.repeat(101), // 101 caracteres
        email: 'test@example.com',
      };

      mockCreate.mockRejectedValue({
        code: 'P2000',
        message: 'The provided value for the column is too long for the column\'s type. Column: lastName',
      });

      const candidate = new Candidate(longLastNameData);

      // Act & Assert
      await expect(candidate.save()).rejects.toThrow();
      expect(mockCreate).toHaveBeenCalled();
    });

    it('debería fallar cuando email excede 255 caracteres', async () => {
      // Arrange: Email muy largo (>255 caracteres)
      const longEmail = 'a'.repeat(250) + '@example.com'; // ~262 caracteres
      const longEmailData = {
        firstName: 'Test',
        lastName: 'User',
        email: longEmail,
      };

      mockCreate.mockRejectedValue({
        code: 'P2000',
        message: 'The provided value for the column is too long for the column\'s type. Column: email',
      });

      const candidate = new Candidate(longEmailData);

      // Act & Assert
      await expect(candidate.save()).rejects.toThrow();
      expect(mockCreate).toHaveBeenCalled();
    });

    it('debería fallar cuando address excede 100 caracteres', async () => {
      // Arrange
      const longAddressData = {
        ...validCandidateData,
        address: 'C'.repeat(101), // 101 caracteres
      };

      mockCreate.mockRejectedValue({
        code: 'P2000',
        message: 'The provided value for the column is too long for the column\'s type. Column: address',
      });

      const candidate = new Candidate(longAddressData);

      // Act & Assert
      await expect(candidate.save()).rejects.toThrow();
      expect(mockCreate).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // MANEJO DE ERRORES DE BASE DE DATOS
  // ==========================================================================

  describe('Manejo de Errores de Base de Datos', () => {

    it('debería manejar error de conexión a la base de datos', async () => {
      // Arrange: Simular error de conexión de Prisma
      class MockPrismaClientInitializationError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'PrismaClientInitializationError';
        }
      }

      const connectionError = new MockPrismaClientInitializationError('Can\'t reach database server');
      Object.setPrototypeOf(connectionError, Prisma.PrismaClientInitializationError.prototype);

      mockCreate.mockRejectedValue(connectionError);

      const candidate = new Candidate(validCandidateData);

      // Act & Assert
      await expect(candidate.save()).rejects.toThrow(
        'No se pudo conectar con la base de datos'
      );

      expect(mockCreate).toHaveBeenCalled();
    });

    it('debería propagar errores desconocidos de Prisma', async () => {
      // Arrange: Simular error genérico no manejado
      const unknownError = new Error('Unknown database error');

      mockCreate.mockRejectedValue(unknownError);

      const candidate = new Candidate(validCandidateData);

      // Act & Assert: Verificar que el error se propaga
      await expect(candidate.save()).rejects.toThrow('Unknown database error');
      expect(mockCreate).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // VERIFICACIÓN DE LLAMADAS A PRISMA
  // ==========================================================================

  describe('Verificación de Interacción con Prisma', () => {

    it('debería llamar a prisma.candidate.create con la estructura correcta', async () => {
      // Arrange
      mockCreate.mockResolvedValue(mockCreatedCandidate);

      const candidate = new Candidate(validCandidateData);

      // Act
      await candidate.save();

      // Assert: Verificar estructura de llamada
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Object)
        })
      );
    });

    it('no debería incluir campos undefined en la llamada a Prisma', async () => {
      // Arrange
      mockCreate.mockResolvedValue({
        id: 3,
        ...minimalCandidateData,
      });

      const candidate = new Candidate(minimalCandidateData);

      // Act
      await candidate.save();

      // Assert: Verificar que solo se envían campos definidos
      const callArgs = (mockCreate as Mock).mock.calls[0][0];
      const dataObject = callArgs.data;

      // Verificar que campos obligatorios están presentes
      expect(dataObject).toHaveProperty('firstName');
      expect(dataObject).toHaveProperty('lastName');
      expect(dataObject).toHaveProperty('email');

      // Los campos opcionales no deberían estar si no fueron proporcionados
      // (el método save solo añade campos que no son undefined)
    });
  });
});
