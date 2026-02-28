/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts', '!src/index.ts', '!src/tests/**'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'clover'],
    coverageThreshold: {
        global: {
            statements: 50,
            branches: 30,
            functions: 50,
            lines: 50,
        },
        './src/application/validator.ts': {
            statements: 55,
            functions: 55,
            lines: 55,
        },
        './src/application/services/candidateService.ts': {
            statements: 60,
            lines: 60,
        },
    },
};
