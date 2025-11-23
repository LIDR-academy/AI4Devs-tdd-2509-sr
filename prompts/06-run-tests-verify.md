# Prompt 06: Running Tests and Final Verification

## Objective
Run all tests, fix any issues, and prepare the deliverables for submission.

## Prompt

```
I need to run the tests and verify everything works correctly for the Activity 2 submission.

Please complete these tasks:

1. **Run the tests**
   ```bash
   cd backend
   npm test
   ```

2. **Fix any failing tests or configuration issues**
   - If tests fail, analyze the error messages
   - Fix import paths, mock configurations, or test logic as needed
   - Re-run tests until all pass

3. **Generate test coverage report** (optional but recommended)
   ```bash
   npm run test:coverage
   ```

4. **Verify the test file structure**
   Confirm that `backend/src/tests/tests-iniciales.test.ts` contains:
   - Tests for "Form data reception" (validation)
   - Tests for "Database saving" (with mocks)
   - At least one passing test in each category

5. **Create the prompts documentation file**
   Create `prompts/prompts-iniciales.md` with:
   - All prompts used during this exercise
   - Brief description of what each prompt accomplished
   - Any manual adjustments made

6. **Prepare for git submission**
   Output a summary with:
   - Total number of tests
   - Number of passing tests
   - Test coverage percentage (if available)
   - List of files created/modified
   - Git commands needed for submission:
     ```bash
     git checkout -b tests-iniciales
     git add backend/src/tests/tests-iniciales.test.ts
     git add prompts/prompts-iniciales.md
     git commit -m "Add initial unit tests for candidate insertion - Activity 2"
     git push origin tests-iniciales
     ```

Output:
- Test execution results
- Any fixes applied
- Final summary of deliverables
- Ready for pull request creation
```

## Expected Output

- All tests passing
- Test coverage report (optional)
- `prompts/prompts-iniciales.md` documentation
- Git commands for submission
- Confirmation that deliverables are ready
