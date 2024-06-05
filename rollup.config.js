import typescript from 'rollup-plugin-typescript2';
import autoExternal from 'rollup-plugin-auto-external';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.js',
      format: 'es',
      sourcemap: false,
    },
    plugins: [
      json(),
      autoExternal(),
      typescript({
        tsconfig: './tsconfig.json',
        tsconfigOverride: {
          compilerOptions: { module: 'ESNext' }
        }
      }),
      terser(),
    ],
  },
]
