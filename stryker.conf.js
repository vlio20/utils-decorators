module.exports = {
    mutator: 'typescript',
    packageManager: 'npm',
    reporters: ['progress', 'html', 'dashboard'],
    coverageAnalysis: 'off',
    mutate: ['src/**/*.ts', '!src/**/*.spec.ts'],
    command: 'npm run test',
    thresholds: {
      break: 95
    }
}