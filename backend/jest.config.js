/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  preset: "ts-jest",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: ["**/__tests__/**/*.test.(ts|js)", "**/?(*.)+(spec|test).(ts|js)"],
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
  ],
  setupFilesAfterEnv: [],
  resetMocks: true,
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      isolatedModules: true,
      tsconfig: {
        noImplicitAny: false,
      },
    }],
  },
};