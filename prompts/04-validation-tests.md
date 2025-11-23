# Prompt 04: Test Implementation - Data Validation (Form Data Reception)

## Objective
Implement unit tests for candidate data validation, covering the "form data reception" test family required by Activity 2.

## Prompt

```
I need to implement unit tests for the candidate data validation functionality. These tests cover the "form data reception" test family.

First, read these files to understand the validation logic:
- backend/src/application/validator.ts
- backend/src/application/services/candidateService.ts

Then create the test file `backend/src/tests/tests-iniciales.test.ts` with the following structure:

```typescript
// Tests for candidate insertion functionality
// Activity 2: AI4Devs TDD Exercise

describe('Candidate Data Validation', () => {
  // Test valid candidate data
  // Test firstName validation (empty, too short, invalid chars, too long)
  // Test lastName validation (empty, too short, invalid chars, too long)
  // Test email validation (empty, invalid format)
  // Test phone validation (invalid format - should be Spanish format)
  // Test address validation (too long)
  // Test education validation (dates, required fields)
  // Test workExperience validation
});
```

Requirements:
1. Import the validation functions from the validator module
2. Create test cases for both valid and invalid scenarios
3. Use descriptive test names that explain what is being tested
4. Group related tests in nested describe blocks
5. Test edge cases (empty strings, null values, boundary lengths)

Test cases must include at minimum:
- Valid candidate data passes all validations
- Empty firstName fails validation
- Invalid email format fails validation
- Invalid phone format (non-Spanish) fails validation
- Valid Spanish phone number passes validation

Use Jest's expect assertions for validating results.

After creating the tests, do NOT run them yet (we'll add database tests first).

Output:
- The complete test file content
- Summary of test cases created
```

## Expected Output

- `backend/src/tests/tests-iniciales.test.ts` with validation tests
- Summary of test cases implemented
