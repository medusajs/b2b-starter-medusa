const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const esbuild = require('rollup-plugin-esbuild').default;
const { terser } = require('rollup-plugin-terser');

module.exports = {
    input: 'src/index.ts',
    external: ['react', 'react-dom'],
    plugins: [
        peerDepsExternal(),
        resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'] }),
        commonjs(),
        json(),
        esbuild({
            include: /\.[jt]sx?$/,
            exclude: /node_modules/,
            minify: process.env.NODE_ENV === 'production',
            target: 'es2017',
            jsx: 'automatic',
            tsconfig: 'tsconfig.json',
            loaders: {
                '.ts': 'ts',
                '.tsx': 'tsx',
                '.js': 'js',
                '.jsx': 'jsx'
            }
        }),
        terser()
    ],
    output: [
        { file: 'dist/index.esm.js', format: 'esm', sourcemap: true },
        { file: 'dist/index.cjs.js', format: 'cjs', sourcemap: true, exports: 'named' }
    ]
};
