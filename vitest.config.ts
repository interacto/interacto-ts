import { defineConfig } from 'vitest/config'
import babel from '@rollup/plugin-babel';

const babelPlugin = babel({
    // Indique à Babel les extensions à transformer
    extensions: ['.ts', '.tsx'],
    // Lit le fichier babel.config.cjs du projet
    configFile: true,
    // Emballe les helpers Babel dans le bundle (pas besoin de @babel/runtime)
    babelHelpers: 'bundled',
});

export default defineConfig({
    plugins: [babelPlugin],
    test: {
        pool: 'vmThreads',
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            reportOnFailure: true,
            thresholds: {
                branches: 80,
                functions: 90,
                lines: 90,
                statements: 90
            }
        }
    }
})