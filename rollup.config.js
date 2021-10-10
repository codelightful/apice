import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'src/apice.mjs',
    output: {
        file: './dist/apice.min.js',
        format: 'iife',
        name: 'Apice',
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