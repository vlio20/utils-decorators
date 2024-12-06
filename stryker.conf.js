module.exports = {
    mutator: 'typescript',
    packageManager: 'npm',
    reporters: ['progress', 'html'],
    coverageAnalysis: 'off',
    mutate: ['src/**/*.ts', '!src/**/*.spec.ts'],
    testFiles: ["test/**/*.@(js|ts)"],
    nodeArgs: ["--loader", "ts-node/esm"],
    forceBail: true,
    thresholds: {
      break: 95
    }
}