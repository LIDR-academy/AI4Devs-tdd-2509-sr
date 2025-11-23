// Test fixtures for candidate data

export const validCandidateData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '612345678',
  address: '123 Main St',
  educations: [
    {
      institution: 'University of Test',
      title: 'Computer Science',
      startDate: '2020-01-01',
      endDate: '2024-01-01',
    },
  ],
  workExperiences: [
    {
      company: 'Test Company',
      position: 'Software Engineer',
      description: 'Worked on testing',
      startDate: '2024-02-01',
      endDate: '2024-12-01',
    },
  ],
  cv: {
    filePath: 'uploads/test-cv.pdf',
    fileType: 'application/pdf',
  },
};

export const invalidCandidateData = {
  firstName: 'J', // Too short
  lastName: 'D',
  email: 'invalid-email', // Invalid format
  phone: '123', // Invalid format
};

export const candidateWithDuplicateEmail = {
  ...validCandidateData,
  email: 'existing@example.com',
};

export const savedCandidate = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '612345678',
  address: '123 Main St',
};

