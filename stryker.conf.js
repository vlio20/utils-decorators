module.exports = function (config) {
  config.set({
    mutator: 'typescript',
    packageManager: 'npm',
    reporters: ['progress', 'html', 'dashboard'],
    testRunner: 'jest',
    coverageAnalysis: 'off',
    mutate: ['src/**/*.ts', '!src/**/*.spec.ts'],
    thresholds: {
      break: 100
    }
  });
};
