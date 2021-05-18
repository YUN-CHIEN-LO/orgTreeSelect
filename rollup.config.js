import babel from 'rollup-plugin-babel';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import alias from 'rollup-plugin-alias';
import path from 'path';

const pathResolve = p => path.resolve(__dirname, p);
const name = 'index';

module.exports = {
    input: 'src/js/index.js',
    output: [{
        file: `dist/${name}.umd.js`,
        format: 'umd',
        name: 'OrgTreeSelect',
    }, ],
    plugins: [
        json(),
        resolve({
            browser: true,
        }),
        commonjs(),
        babel({
            exclude: 'node_modules/**',
        }),
        alias({
            '@': pathResolve('src')
        })
    ],
};