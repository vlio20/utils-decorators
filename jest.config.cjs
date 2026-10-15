module.exports = {
  roots: ['<rootDir>/src'],
  transform: { '^.+\\.[jt]sx?$': '<rootDir>/jest.transform.cjs' },
  transformIgnorePatterns: ['/node_modules/(?!tinyqueue/)'],
  coverageProvider: 'v8',
};
