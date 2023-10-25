// resolve将我们编写的源码与依赖的第三方库进行合并
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import dts from 'rollup-plugin-dts'
import typescript from 'rollup-plugin-typescript2'
import terser from '@rollup/plugin-terser'

export default [
  { // umd
    input: 'src/index.ts',
    // external: [],
    output: [
      {
        name: 'webdb',
        file: 'dist/index.min.js',
        format: 'umd',
        //   indent: false,
      },
      {
        file: pkg.main,
        format: 'cjs',
        indent: false,
        exports: 'default',
      },
      {
        file: pkg.module,
        format: 'es',
        indent: false,
      },
      {
        file: 'dist/index.mjs',
        format: 'es',
        indent: false,
      }
    ],
    plugins: [
      resolve({
        extensions: ['.ts', '.js'],
      }),
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            declaration: false
          }
        }
      }),
      babel({
        extensions: ['.ts', '.js'],
        exclude: 'node_modules/**',
        skipPreflightCheck: true,
        babelHelpers: 'bundled',
        plugins: [
          [
            '@babel/plugin-transform-runtime',
            {
              useESModules: true,
            },
          ],
        ],
        babelHelpers: 'runtime',
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ]
  },
  { // 生成 .d.ts 类型声明文件
    input: 'src/index.ts',
    output: {
      file: pkg.types,
      format: 'es',
    },
    plugins: [dts()],
  },
]
