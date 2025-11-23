# Prompt 02: Jest Environment Setup with ts-jest

## Objective
Configure Jest for TypeScript testing in the backend project (Activity 1).

## Prompt

```
I need to configure Jest for testing a TypeScript backend project. The project uses:
- TypeScript
- Prisma ORM
- Express.js

Please complete the following tasks:

1. Check if jest and ts-jest are already installed in backend/package.json
   - If not installed, install them: `npm install --save-dev jest ts-jest @types/jest`

2. Create a Jest configuration file at `backend/jest.config.js` with:
   - TypeScript support via ts-jest
   - Test file pattern: `**/*.test.ts`
   - Test environment: node
   - Module path aliases if needed (check tsconfig.json)
   - Coverage configuration
   - Ignore patterns for node_modules and dist

3. Update `backend/package.json` scripts to include:
   - "test": "jest"
   - "test:watch": "jest --watch"
   - "test:coverage": "jest --coverage"

4. Create a simple test file `backend/src/tests/setup.test.ts` that verifies Jest is working:
   - A simple "describe" block with one test that passes
   - This confirms the setup is correct

5. Run `npm test` in the backend folder to verify everything works

After completing, output a summary of:
- Files created/modified
- Any issues encountered and how they were resolved
- Confirmation that `npm test` runs successfully
```

## Expected Output

- `backend/jest.config.js` - Jest configuration
- `backend/src/tests/setup.test.ts` - Simple verification test
- Updated `backend/package.json` with test scripts
- Console output showing successful test run
