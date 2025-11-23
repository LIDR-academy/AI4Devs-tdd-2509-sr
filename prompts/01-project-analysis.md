# Prompt 01: Project Analysis and Understanding

## Objective
Analyze the project structure to understand the candidate insertion functionality and prepare for setting up Jest testing.

## Prompt

```
I'm working on an AI4Devs TDD exercise. I need to analyze this project to understand:

1. The overall project structure (frontend/backend)
2. The candidate insertion functionality in the backend
3. The database schema (Prisma)
4. Any existing test configuration

Please:
1. Explore the project structure
2. Read the key files related to candidate management:
   - backend/src/application/services/candidateService.ts
   - backend/src/application/validator.ts
   - backend/src/domain/models/Candidate.ts
   - backend/src/presentation/controllers/candidateController.ts
   - backend/prisma/schema.prisma
3. Read the backend/package.json to check existing dependencies

After analysis, create a file `prompts/project-analysis-output.md` with:
- Summary of the project architecture
- Description of the candidate insertion flow
- List of validation rules found in validator.ts
- Key functions that need to be tested
- Current test-related dependencies installed

This analysis will be used for the next steps: configuring Jest and writing unit tests.
```

## Expected Output

A file `prompts/project-analysis-output.md` containing:
- Project architecture summary
- Candidate insertion flow description
- Validation rules
- Functions to test
- Current dependencies analysis
