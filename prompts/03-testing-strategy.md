# Prompt 03: Testing Strategy Development

## Objective
Develop a comprehensive testing strategy for the candidate insertion functionality, documenting it in a testing guide.

## Prompt

```
I need to create a testing strategy for the candidate insertion functionality in an ATS (Applicant Tracking System).

Based on Activity 2 requirements, I need tests for two main areas:
1. **Form data reception** - Validation of incoming candidate data
2. **Database saving** - Persisting candidates to the database

Please analyze:
- backend/src/application/validator.ts - for validation rules
- backend/src/application/services/candidateService.ts - for business logic
- backend/src/domain/models/Candidate.ts - for the data model
- backend/prisma/schema.prisma - for database constraints

Then create a file `prompts/testing-guide.md` that includes:

## Testing Guide Structure

1. **Overview**
   - Purpose of the tests
   - Testing approach (unit tests with mocking)

2. **Test Categories**

   ### A. Data Validation Tests (Form Data Reception)
   List specific test cases for:
   - firstName validation (required, format, length)
   - lastName validation (required, format, length)
   - email validation (required, format, uniqueness)
   - phone validation (optional, Spanish format)
   - address validation (optional, max length)
   - education array validation
   - workExperience array validation
   - cv object validation

   ### B. Database Operation Tests
   List specific test cases for:
   - Successful candidate creation
   - Handling duplicate email errors
   - Saving related entities (education, work experience, resume)
   - Error handling scenarios

3. **Mocking Strategy**
   - How to mock Prisma Client
   - What to mock vs what to test

4. **Test File Structure**
   - Recommended organization of test files
   - Naming conventions

5. **Sample Test Cases Table**
   | Test ID | Category | Description | Expected Result |
   |---------|----------|-------------|-----------------|
   | VAL-001 | Validation | Valid candidate data passes validation | true |
   | ... | ... | ... | ... |

Output the complete testing-guide.md file.
```

## Expected Output

A comprehensive `prompts/testing-guide.md` file that serves as a blueprint for implementing the tests.
