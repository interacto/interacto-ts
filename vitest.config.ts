import { defineConfig } from 'vitest/config'
import babel from '@rollup/plugin-babel';

const babelPlugin = babel({
    extensions: ['.ts'],
    configFile: true,
    babelHelpers: 'bundled',
});

export default defineConfig({
    plugins: [babelPlugin],
    test: {
        pool: 'vmThreads',
        include: ["./test/**/*.test.ts"],
        environment: 'jsdom',
        coverage: {
            reporter: ["json", "html"],
            provider: 'v8',
            reportOnFailure: true,
            include: ["src/**"],
            thresholds: {
                branches: 80,
                functions: 90,
                lines: 90,
                statements: 90
            }
        }
    }
})