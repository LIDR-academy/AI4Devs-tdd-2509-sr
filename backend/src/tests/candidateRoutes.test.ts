import request from 'supertest';
import { app } from '../app';
import * as candidateService from '../application/services/candidateService';

// Mock the service to avoid real DB interaction
jest.mock('../application/services/candidateService');

const mockedAddCandidate = candidateService.addCandidate as jest.MockedFunction<typeof candidateService.addCandidate>;

const validPayload = {
    firstName: 'Carlos',
    lastName: 'Mendoza',
    email: 'carlos.mendoza@test.com',
    phone: '+525543614524',
    address: 'Calle Palmas 45',
    educations: [],
    workExperiences: [],
};

const savedResponse = {
    id: 1,
    firstName: 'Carlos',
    lastName: 'Mendoza',
    email: 'carlos.mendoza@test.com',
    phone: '+525543614524',
    address: 'Calle Palmas 45',
};

describe('POST /candidates — Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── 201 Created ──────────────────────────────────────────────────

    it('debe retornar 201 al crear un candidato correctamente', async () => {
        mockedAddCandidate.mockResolvedValue(savedResponse as any);

        const res = await request(app)
            .post('/candidates')
            .send(validPayload);

        expect(res.status).toBe(201);
    });

    it('debe incluir los datos del candidato en el body de respuesta', async () => {
        mockedAddCandidate.mockResolvedValue(savedResponse as any);

        const res = await request(app)
            .post('/candidates')
            .send(validPayload);

        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email', 'carlos.mendoza@test.com');
    });

    it('debe llamar a addCandidate con los datos del body', async () => {
        mockedAddCandidate.mockResolvedValue(savedResponse as any);

        await request(app)
            .post('/candidates')
            .send(validPayload);

        expect(mockedAddCandidate).toHaveBeenCalledWith(validPayload);
    });

    // ── 400 Bad Request ──────────────────────────────────────────────

    it('debe retornar 400 si el servicio lanza un error de validación', async () => {
        mockedAddCandidate.mockRejectedValue(new Error('Error: Invalid name'));

        const res = await request(app)
            .post('/candidates')
            .send({ ...validPayload, firstName: '' });

        expect(res.status).toBe(400);
    });

    it('debe retornar 400 si el email ya existe en la BD', async () => {
        mockedAddCandidate.mockRejectedValue(new Error('The email already exists in the database'));

        const res = await request(app)
            .post('/candidates')
            .send(validPayload);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('The email already exists in the database');
    });

    // ── Content-Type ─────────────────────────────────────────────────

    it('la respuesta debe tener Content-Type application/json', async () => {
        mockedAddCandidate.mockResolvedValue(savedResponse as any);

        const res = await request(app)
            .post('/candidates')
            .send(validPayload);

        expect(res.headers['content-type']).toMatch(/json/);
    });

});
