/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  // Define JWT_SECRET, que config/auth.ts exige al cargar.
  setupFiles: ["<rootDir>/tests/jest.setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/silence-console.ts"],
};
