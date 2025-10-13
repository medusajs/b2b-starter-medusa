const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const esbuild = require('rollup-plugin-esbuild');
const { terser } = require('rollup-plugin-terser');

module.exports = {
    input: 'src/index.ts',
    external: ['react', 'react-dom'],
    plugins: [
        peerDepsExternal(),
        resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'] }),
        commonjs(),
        esbuild({
            include: /src\/.*\\.(ts|tsx|js|jsx)$/,
            minify: process.env.NODE_ENV === 'production',
            target: 'es2017',
            tsconfig: 'tsconfig.json'
        }),
        terser()
    ],
    output: [
        { file: 'dist/index.esm.js', format: 'esm', sourcemap: true },
        { file: 'dist/index.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' }
    ]
};
