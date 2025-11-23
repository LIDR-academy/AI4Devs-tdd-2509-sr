# Prompts Overview - AI4Devs TDD Exercise

This folder contains a series of prompts designed to be executed sequentially by Claude Code to complete Activities 1 and 2 of the AI4Devs TDD module.

## Files in this folder

| File | Purpose |
|------|---------|
| `00-overview.md` | This file - overview and instructions |
| `01-project-analysis.md` | Analyze project structure |
| `02-jest-setup.md` | Configure Jest environment |
| `03-testing-strategy.md` | Develop testing strategy |
| `04-validation-tests.md` | Implement validation tests |
| `05-database-tests.md` | Implement database tests |
| `06-run-tests-verify.md` | Run and verify tests |
| `prompts-iniciales-template.md` | Template for final documentation |

## Activity 1: Setting up Jest testing environment
- **Prompt 01**: Project analysis and understanding
- **Prompt 02**: Jest environment setup with ts-jest

## Activity 2: Creating unit tests for candidate insertion
- **Prompt 03**: Testing strategy development
- **Prompt 04**: Test implementation for data validation (form data reception)
- **Prompt 05**: Test implementation for database operations
- **Prompt 06**: Running tests and final verification

## How to use these prompts

1. Open each prompt file in order (01, 02, 03, etc.)
2. Copy the **Prompt** section content and paste it into a new Claude Code session
3. Review the output and any generated files
4. Make manual adjustments if needed
5. Proceed to the next prompt
6. After all prompts, use `prompts-iniciales-template.md` to create your final `prompts-iniciales.md`

## Execution Order

```
┌─────────────────────────────────────────────────────────────┐
│                     ACTIVITY 1                               │
├─────────────────────────────────────────────────────────────┤
│  01-project-analysis.md  →  02-jest-setup.md                │
│  (Understand project)       (Configure Jest)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     ACTIVITY 2                               │
├─────────────────────────────────────────────────────────────┤
│  03-testing-strategy.md  →  04-validation-tests.md          │
│  (Plan tests)               (Form data tests)                │
│                              │                               │
│                              ▼                               │
│  05-database-tests.md    →  06-run-tests-verify.md          │
│  (Database tests)           (Run & verify)                   │
└─────────────────────────────────────────────────────────────┘
```

## Expected Deliverables

After completing all prompts, you should have:

### Activity 1 Output:
- `backend/jest.config.js` - Jest configuration
- Updated `backend/package.json` with test scripts
- `npm test` runs successfully

### Activity 2 Output:
- `backend/src/tests/tests-iniciales.test.ts` - Unit tests file
- `prompts/prompts-iniciales.md` - Documentation of prompts used
- Tests covering:
  - Form data reception/validation (at least 1 test)
  - Database saving operations with mocks (at least 1 test)

### Optional Output:
- `prompts/testing-guide.md` - Testing strategy document
- `prompts/project-analysis-output.md` - Project analysis

## Branch for submission

```bash
git checkout -b tests-iniciales
git add backend/src/tests/tests-iniciales.test.ts
git add prompts/prompts-iniciales.md
git commit -m "Add initial unit tests for candidate insertion - Activity 2"
git push origin tests-iniciales
# Then create Pull Request on GitHub
```

## Tips for Success

1. **Review AI output** - Always check generated code for correctness
2. **Manual adjustments** - Feel free to modify generated tests as needed
3. **Run tests frequently** - Verify tests pass after each prompt
4. **Document changes** - Note any manual adjustments in prompts-iniciales.md
