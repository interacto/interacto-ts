import { defineConfig } from 'vitest/config'

export default defineConfig({
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