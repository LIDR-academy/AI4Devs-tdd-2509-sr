import { validateCandidateData } from '../application/validator';

describe('validateCandidateData', () => {

    const validCandidate = {
        firstName: 'Juan',
        lastName: 'García',
        email: 'juan.garcia@test.com',
        phone: '+525543614524',
        address: 'Calle Test 123',
        educations: [],
        workExperiences: [],
    };

    // ── Casos válidos ────────────────────────────────────────────────

    it('debe aceptar un candidato con datos válidos', () => {
        expect(() => validateCandidateData(validCandidate)).not.toThrow();
    });

    it('debe aceptar un candidato sin teléfono (campo opcional)', () => {
        const data = { ...validCandidate, phone: undefined };
        expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('debe aceptar un candidato sin dirección (campo opcional)', () => {
        const data = { ...validCandidate, address: undefined };
        expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('debe omitir validación cuando se proporciona un id (edición)', () => {
        expect(() => validateCandidateData({ id: 1 })).not.toThrow();
    });

    // ── Nombre ───────────────────────────────────────────────────────

    it('debe lanzar error si firstName está vacío', () => {
        const data = { ...validCandidate, firstName: '' };
        expect(() => validateCandidateData(data)).toThrow('Invalid name');
    });

    it('debe lanzar error si firstName tiene solo 1 carácter', () => {
        const data = { ...validCandidate, firstName: 'A' };
        expect(() => validateCandidateData(data)).toThrow('Invalid name');
    });

    it('debe lanzar error si firstName contiene números', () => {
        const data = { ...validCandidate, firstName: 'Juan123' };
        expect(() => validateCandidateData(data)).toThrow('Invalid name');
    });

    // ── Email ────────────────────────────────────────────────────────

    it('debe lanzar error si el email es inválido', () => {
        const data = { ...validCandidate, email: 'no-es-un-email' };
        expect(() => validateCandidateData(data)).toThrow('Invalid email');
    });

    it('debe lanzar error si el email está vacío', () => {
        const data = { ...validCandidate, email: '' };
        expect(() => validateCandidateData(data)).toThrow('Invalid email');
    });

    // ── Teléfono ─────────────────────────────────────────────────────

    it('debe aceptar un número internacional con prefijo +', () => {
        const data = { ...validCandidate, phone: '+525543614524' };
        expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('debe aceptar un número local de 9 dígitos', () => {
        const data = { ...validCandidate, phone: '612345678' };
        expect(() => validateCandidateData(data)).not.toThrow();
    });

    it('debe lanzar error si el teléfono tiene letras', () => {
        const data = { ...validCandidate, phone: 'abc123' };
        expect(() => validateCandidateData(data)).toThrow('Invalid phone');
    });

    it('debe lanzar error si el teléfono tiene menos de 7 dígitos', () => {
        const data = { ...validCandidate, phone: '12345' };
        expect(() => validateCandidateData(data)).toThrow('Invalid phone');
    });

});
