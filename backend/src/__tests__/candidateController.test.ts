import { addCandidateController } from '../presentation/controllers/candidateController';
import * as service from '../application/services/candidateService';

// Mock the addCandidate service function so controller unit test isolates request/response handling
jest.mock('../application/services/candidateService');

describe('Candidate Controller - addCandidateController', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Arrange-Act-Assert: should respond 201 and return saved candidate when service succeeds', async () => {
    // Arrange: preparar req/res y simular la respuesta del servicio
    const mockReq: any = { body: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' } };
    const mockSaved = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
    const mockRes: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    // Configurar mock del servicio para resolver con el candidato guardado
    (service.addCandidate as jest.Mock).mockResolvedValue(mockSaved);

    // Act: llamar al controlador
    await addCandidateController(mockReq, mockRes);

    // Assert: verificar que se devolviera 201 y el cuerpo esperado
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Candidate added successfully', data: mockSaved });
  });
});
