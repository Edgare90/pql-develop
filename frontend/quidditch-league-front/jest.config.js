/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  testMatch: ['**/__pruebas__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
};