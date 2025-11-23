import { validateCandidateData } from '../../application/validator';

describe('validateCandidateData', () => {
  describe('Valid candidate data', () => {
    it('should not throw an error for valid candidate data', () => {
      const validCandidate = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '612345678',
        address: '123 Main St',
      };

      expect(() => validateCandidateData(validCandidate)).not.toThrow();
    });

    it('should not throw an error for valid candidate with education', () => {
      const validCandidate = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '698765432',
        educations: [
          {
            institution: 'University',
            title: 'Degree',
            startDate: '2020-01-01',
            endDate: '2024-01-01',
          },
        ],
      };

      expect(() => validateCandidateData(validCandidate)).not.toThrow();
    });
  });

  describe('Invalid candidate data', () => {
    it('should throw an error for invalid email', () => {
      const invalidCandidate = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '612345678',
      };

      expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid email');
    });

    it('should throw an error for invalid phone number', () => {
      const invalidCandidate = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '123456789', // Invalid phone (doesn't start with 6, 7, or 9)
      };

      expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid phone');
    });

    it('should throw an error for invalid first name', () => {
      const invalidCandidate = {
        firstName: 'J', // Too short
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '612345678',
      };

      expect(() => validateCandidateData(invalidCandidate)).toThrow('Invalid name');
    });
  });
});



