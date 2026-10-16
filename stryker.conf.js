module.exports = {
    packageManager: 'npm',
    reporters: ['progress', 'html', 'dashboard'],
    testRunner: 'jest',
    coverageAnalysis: 'perTest',
    incremental: true,
    incrementalFile: 'reports/stryker-incremental.json',
    mutate: ['src/**/*.ts', '!src/**/*.spec.ts'],
    thresholds: {
      break: 95
    }
}
