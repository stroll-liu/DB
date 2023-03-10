// resolve将我们编写的源码与依赖的第三方库进行合并
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import dts from 'rollup-plugin-dts'
import typescript from 'rollup-plugin-typescript2'
import {terser} from 'rollup-plugin-terser'

import pkg from './package.json'

const override = { compilerOptions: { declaration: false } } // 设置生成相应的 .d.ts' file.
const extensions = ['.ts', '.js']
const babelRuntimeVersion = pkg.devDependencies['@babel/runtime'].replace(/^[^0-9]*/, '')

export default [
  { // umd
    input: 'index.ts',
    // external: [],
    output: {
      name: 'SDB',
      file: 'dist/index.min.js',
      format: 'umd',
      //   indent: false,
    },
    plugins: [
      resolve({ extensions }), // so Rollup can find `ms`
      typescript({ tsconfigOverride: override }), // 会合并 tsconfig的配置
      babel({
        extensions,
        exclude: 'node_modules/**',
        skipPreflightCheck: true,
        babelHelpers: 'bundled',
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },
  { // commonjs
    input: 'index.ts',
    external: [],
    output: {
      file: pkg.main,
      format: 'cjs',
      indent: false,
      exports: 'default',
    },
    plugins: [
      resolve({
        extensions,
      }),
      typescript({ useTsconfigDeclarationDir: true }),
      babel({
        extensions,
        plugins: [['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }]],
        babelHelpers: 'runtime',
      }),
    ],
  },
  { // ES modules
    input: 'index.ts',
    external: [],
    output: {
      file: pkg.module,
      format: 'es',
      indent: false,
    },
    plugins: [
      resolve({
        extensions,
      }),
      typescript({ tsconfigOverride: override }),
      babel({
        extensions,
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            {
              version: babelRuntimeVersion,
              useESModules: true,
            },
          ],
        ],
        babelHelpers: 'runtime',
      }),
    ],
  },
  { // ES for Browsers
    input: 'index.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'es',
      indent: false,
    },
    plugins: [
      resolve({
        extensions,
      }),
      typescript({ tsconfigOverride: override }),
      babel({
        extensions,
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            {
              version: babelRuntimeVersion,
              useESModules: true,
            },
          ],
        ],
        babelHelpers: 'runtime',
      }),
    ],
  },
  { // 生成 .d.ts 类型声明文件
    input: 'index.ts',
    output: {
      file: pkg.types,
      format: 'es',
    },
    plugins: [dts()],
  },
]
