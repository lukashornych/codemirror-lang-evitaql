import typescript from '@rollup/plugin-typescript'
import { lezer } from '@lezer/generator/rollup'
import json from '@rollup/plugin-json'

export default {
  input: 'src/index.ts',
  external: id => id !== 'tslib' && !/^(\.?\/|\w:)/.test(id),
  output: [
    { file: 'dist/index.cjs', format: 'cjs' },
    { dir: 'dist', format: 'es', preserveModules: true, entryFileNames: '[name].mjs' }
  ],
  plugins: [
    lezer(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src'
    }),
    json()
  ]
}
