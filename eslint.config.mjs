import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      /*
       * Proyecto migrado desde Next 14 / React 18 hacia Next 16.
       * Estas reglas se relajan temporalmente para no bloquear producción
       * por deuda técnica heredada del template y componentes grandes.
       */

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',

      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/immutability': 'off',

      'prefer-const': 'warn',
    },
  },

  globalIgnores([
    '.next/**',
    'node_modules/**',
    'out/**',
    'build/**',
    'dist/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig