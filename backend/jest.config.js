/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  // JWT_SECRET no tiene default en config/auth.ts (T3, es un secreto), sin
  // esto, cualquier test que importe src/server.ts fallaría al cargar el
  // módulo antes de correr un solo test.
  setupFiles: ["<rootDir>/tests/jest.setup.ts"],
};
