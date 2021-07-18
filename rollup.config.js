import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'src/alux.mjs',
    output: {
        file: './dist/alux.min.js',
        format: 'iife',
        name: 'Alux',
        sourcemap: true,
        plugins: [
            terser()
        ]
    },
    watch: {
        exclude: 'node_modules/**',
        include: './src/**'
    },
    plugins: [
        resolve(),
        babel({ 
            exclude: "node_modules/**",
            babelHelpers: 'bundled' 
        })
    ]
};