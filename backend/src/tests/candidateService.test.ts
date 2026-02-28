import { addCandidate } from '../application/services/candidateService';
import { Candidate } from '../domain/models/Candidate';

// Mock Candidate model to avoid real DB calls
jest.mock('../domain/models/Candidate');
jest.mock('../domain/models/Education');
jest.mock('../domain/models/WorkExperience');
jest.mock('../domain/models/Resume');

const MockedCandidate = Candidate as jest.MockedClass<typeof Candidate>;

const validCandidateData = {
    firstName: 'María',
    lastName: 'López',
    email: 'maria.lopez@test.com',
    phone: '+525543614524',
    address: 'Av. Reforma 123, CDMX',
    educations: [],
    workExperiences: [],
};

const savedCandidateMock = {
    id: 42,
    firstName: 'María',
    lastName: 'López',
    email: 'maria.lopez@test.com',
    phone: '+525543614524',
    address: 'Av. Reforma 123, CDMX',
};

describe('candidateService - addCandidate', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        MockedCandidate.prototype.save = jest.fn().mockResolvedValue(savedCandidateMock);
    });

    // ── Casos exitosos ────────────────────────────────────────────────

    it('debe guardar un candidato válido y retornar los datos guardados', async () => {
        const result = await addCandidate(validCandidateData);
        expect(result).toEqual(savedCandidateMock);
        expect(MockedCandidate.prototype.save).toHaveBeenCalledTimes(1);
    });

    it('debe crear una instancia de Candidate con los datos recibidos', async () => {
        await addCandidate(validCandidateData);
        expect(MockedCandidate).toHaveBeenCalledWith(validCandidateData);
    });

    it('debe guardar un candidato sin teléfono ni dirección', async () => {
        const data = { ...validCandidateData, phone: undefined, address: undefined };
        const result = await addCandidate(data);
        expect(result).toEqual(savedCandidateMock);
    });

    // ── Errores de validación ─────────────────────────────────────────

    it('debe lanzar error si el nombre es inválido', async () => {
        const data = { ...validCandidateData, firstName: '' };
        await expect(addCandidate(data)).rejects.toThrow('Invalid name');
    });

    it('debe lanzar error si el email es inválido', async () => {
        const data = { ...validCandidateData, email: 'no-es-email' };
        await expect(addCandidate(data)).rejects.toThrow('Invalid email');
    });

    it('debe lanzar error si el teléfono tiene formato incorrecto', async () => {
        const data = { ...validCandidateData, phone: 'abc' };
        await expect(addCandidate(data)).rejects.toThrow('Invalid phone');
    });

    // ── Errores de base de datos ──────────────────────────────────────

    it('debe lanzar error descriptivo si el email ya existe (P2002)', async () => {
        const prismaError = { code: 'P2002' };
        MockedCandidate.prototype.save = jest.fn().mockRejectedValue(prismaError);

        await expect(addCandidate(validCandidateData))
            .rejects.toThrow('The email already exists in the database');
    });

    it('debe propagar otros errores de base de datos sin modificarlos', async () => {
        const dbError = new Error('DB connection refused');
        MockedCandidate.prototype.save = jest.fn().mockRejectedValue(dbError);

        await expect(addCandidate(validCandidateData)).rejects.toThrow('DB connection refused');
    });

});
