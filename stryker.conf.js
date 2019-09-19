module.exports = function (config) {
  config.set({
    mutator: 'typescript',
    packageManager: 'npm',
    reporters: ['progress', 'html'],
    testRunner: 'jest',
    coverageAnalysis: 'off',
    mutate: ['src/**/*.ts', '!src/**/*.spec.ts'],
  });
};
