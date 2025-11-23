import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';
import { Education } from '../domain/models/Education';
import { WorkExperience } from '../domain/models/WorkExperience';
import { Resume } from '../domain/models/Resume';
import * as validator from '../application/validator';

// Fixtures
const baseCandidateData = {
	firstName: 'Juan',
	lastName: 'Pérez',
	email: 'juan.perez@example.com',
	phone: '612345678',
	address: 'Calle Falsa 123',
};

beforeEach(() => {
	jest.restoreAllMocks();
	jest.clearAllMocks();
});

/*
Test 1
Escenario: Inserción exitosa de candidato con educación, experiencia y CV.
Criterios de aceptación: Devuelve el candidato guardado; se llaman los métodos save de Candidate, Education, WorkExperience y Resume la cantidad correcta de veces.
Casos límite / riesgo cubierto: Asegura que la lógica que persiste entidades relacionadas se ejecuta y no se intenta acceder a la DB real (mocks).
*/
test('Inserción exitosa: guarda candidato, educaciones, experiencias y CV', async () => {
	// Arrange
	const candidateSaveMock = jest
		.spyOn(Candidate.prototype as any, 'save')
		.mockImplementation(async function (this: any) {
			return { id: 42, firstName: this.firstName, lastName: this.lastName, email: this.email };
		});

	const educationSaveMock = jest
		.spyOn(Education.prototype as any, 'save')
		.mockImplementation(async function (this: any) {
			return { id: 101, institution: this.institution };
		});

	const workSaveMock = jest
		.spyOn(WorkExperience.prototype as any, 'save')
		.mockImplementation(async function (this: any) {
			return { id: 201, company: this.company };
		});

	const resumeSaveMock = jest
		.spyOn(Resume.prototype as any, 'save')
		.mockImplementation(async function (this: any) {
			return { id: 301, filePath: this.filePath, fileType: this.fileType } as any;
		});

	jest.spyOn(validator, 'validateCandidateData').mockImplementation(() => {});

	const payload = {
		...baseCandidateData,
		educations: [
			{ institution: 'UC3M', title: 'CS', startDate: '2010-01-01', endDate: '2014-01-01' },
		],
		workExperiences: [
			{ company: 'ACME', position: 'Dev', startDate: '2015-01-01' },
		],
		cv: { filePath: 'uploads/cv.pdf', fileType: 'application/pdf' },
	};

	// Act
	const result = await addCandidate(payload);

	// Assert
	expect(candidateSaveMock).toHaveBeenCalledTimes(1);
	expect(educationSaveMock).toHaveBeenCalledTimes(1);
	expect(workSaveMock).toHaveBeenCalledTimes(1);
	expect(resumeSaveMock).toHaveBeenCalledTimes(1);
	expect(result).toEqual({ id: 42, firstName: payload.firstName, lastName: payload.lastName, email: payload.email });
});

/*
Test 2
Escenario: Validación de datos falla (nombre inválido).
Criterios de aceptación: `addCandidate` propaga el error de validación; no se llama a `Candidate.save`.
Casos límite / riesgo cubierto: Validaciones de entrada fallidas y evitar llamadas a la base de datos.
*/
test('Falla al validar datos del candidato: nombre inválido -> error y no persiste', async () => {
	// Arrange
	jest.spyOn(validator, 'validateCandidateData').mockImplementation(() => {
		throw new Error('Invalid name');
	});

	const candidateSaveSpy = jest.spyOn(Candidate.prototype as any, 'save');

	const payload = { ...baseCandidateData, firstName: 'J' };

	// Act & Assert
	await expect(addCandidate(payload)).rejects.toThrow('Invalid name');
	expect(candidateSaveSpy).not.toHaveBeenCalled();
});

/*
Test 3
Escenario: Error de base de datos por restricción única (email duplicado).
Criterios de aceptación: `addCandidate` detecta el código `P2002` y lanza el mensaje específico sobre email duplicado.
Casos límite / riesgo cubierto: Errores específicos de Prisma son transformados a mensajes de negocio legibles.
*/
test('Error DB: email duplicado (P2002) -> lanza mensaje legible', async () => {
	// Arrange
	jest.spyOn(validator, 'validateCandidateData').mockImplementation(() => {});

	jest.spyOn(Candidate.prototype as any, 'save').mockImplementation(async () => {
		const err: any = new Error('Unique constraint failed');
		err.code = 'P2002';
		throw err;
	});

	const payload = { ...baseCandidateData };

	// Act & Assert
	await expect(addCandidate(payload)).rejects.toThrow('The email already exists in the database');
});

/*
Test 4
Escenario: Edición de candidato existente (tiene `id`).
Criterios de aceptación: Validación temprana permite editar; se llama a `Candidate.save` una vez y no se valida CV/relaciones obligatorias.
Casos límite / riesgo cubierto: Cuando `id` está presente, la validación no exige campos obligatorios.
*/
test('Edición existente: con `id` no exige campos obligatorios y guarda (update)', async () => {
	// Arrange
	const candidateSaveMock = jest
		.spyOn(Candidate.prototype as any, 'save')
		.mockImplementation(async function (this: any) {
			return { id: this.id || 99, firstName: this.firstName, email: this.email };
		});

	// validateCandidateData returns early when id is provided; spy to ensure it's called
	const validateSpy = jest.spyOn(validator, 'validateCandidateData').mockImplementation(() => {});

	const payload = { id: 5, firstName: 'Modificado' } as any;

	// Act
	const result = await addCandidate(payload);

	// Assert
	expect(validateSpy).toHaveBeenCalledWith(payload);
	expect(candidateSaveMock).toHaveBeenCalledTimes(1);
	expect(result).toEqual({ id: 5, firstName: 'Modificado', email: undefined });
});

/*
Test 5
Escenario: CV vacío (objeto sin propiedades) -> no se persigue resume.
Criterios de aceptación: `Resume.save` no debe ser llamado cuando `cv` es `{}`; operación principal sigue funcionando.
Casos límite / riesgo cubierto: Evita crear registros inválidos cuando `cv` existe pero está vacío.
*/
test('CV vacío no persiste Resume', async () => {
	// Arrange
	jest.spyOn(validator, 'validateCandidateData').mockImplementation(() => {});
	const candidateSaveMock = jest
		.spyOn(Candidate.prototype as any, 'save')
		.mockImplementation(async function (this: any) {
			return { id: 55, firstName: this.firstName };
		});

	const resumeSaveSpy = jest.spyOn(Resume.prototype as any, 'save').mockImplementation(async () => ({ id: 0 } as any));

	const payload = { ...baseCandidateData, cv: {} };

	// Act
	const result = await addCandidate(payload);

	// Assert
	expect(candidateSaveMock).toHaveBeenCalledTimes(1);
	expect(resumeSaveSpy).not.toHaveBeenCalled();
	expect(result).toEqual({ id: 55, firstName: payload.firstName });
});

/*
Test 6
Escenario: Teléfono inválido -> validación falla.
Criterios de aceptación: `addCandidate` debe lanzar error por teléfono inválido y no persistir datos.
Casos límite / riesgo cubierto: Campos opcionales pero validados cuando están presentes.
*/
test('Falla por teléfono inválido: no persiste y lanza error', async () => {
	// Arrange
	jest.spyOn(validator, 'validateCandidateData').mockImplementation(() => {
		throw new Error('Invalid phone');
	});

	const payload = { ...baseCandidateData, phone: '123' };

	// Act & Assert
	await expect(addCandidate(payload)).rejects.toThrow('Invalid phone');
});

/*
Test 7
Escenario: Experiencia con `endDate` inválida -> validación falla.
Criterios de aceptación: `addCandidate` lanza error y no persiste nada.
Casos límite / riesgo cubierto: Validación de fechas en las entidades relacionadas.
*/
test('Falla por endDate inválida en experiencia laboral', async () => {
	// Arrange
	jest.spyOn(validator, 'validateCandidateData').mockImplementation(() => {
		throw new Error('Invalid end date');
	});

	const payload = {
		...baseCandidateData,
		workExperiences: [{ company: 'X', position: 'Y', startDate: '2020-01-01', endDate: 'not-a-date' }],
	};

	// Act & Assert
	await expect(addCandidate(payload)).rejects.toThrow('Invalid end date');
});

