// Babel is now required for vitest to support decorators...
module.exports = {
    presets: [
        [
            '@babel/preset-typescript',
            {
                allowDeclareFields: true,
            },
        ],
    ],
    plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
    ],
};
