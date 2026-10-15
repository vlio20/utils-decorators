const ts = require('typescript');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');

const config = ts.readConfigFile(require.resolve('./tsconfig.test.json'), ts.sys.readFile);
if (config.error) {
  throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
}

const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, __dirname);
const cacheSalt = JSON.stringify([ts.version, options, readFileSync(__filename, 'utf8')]);

module.exports = {
  getCacheKey(sourceText, sourcePath, transformOptions) {
    return createHash('sha256')
      .update(JSON.stringify([sourceText, sourcePath, transformOptions.configString, transformOptions.instrument, cacheSalt]))
      .digest('hex');
  },

  process(sourceText, sourcePath) {
    const result = ts.transpileModule(sourceText, {
      fileName: sourcePath,
      compilerOptions: {
        ...options,
        module: ts.ModuleKind.CommonJS,
        sourceMap: true,
        inlineSources: true,
      },
    });

    const map = JSON.parse(result.sourceMapText);
    map.sources = [sourcePath];

    return { code: result.outputText, map };
  },
};
