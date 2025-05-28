import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

// 🎯 프로젝트 내부 커스텀 규칙 import
import localRules from './eslint-rules/index.js';

console.log('Loaded local rules:', localRules);

export default [
  // 기본 JavaScript 권장 설정
  js.configs.recommended,

  // ESLint 규칙 파일 설정
  {
    files: ['eslint-rules/**/*.{js,ts}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // 기본 설정
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        NodeJS: 'readonly',
        console: 'readonly',
        process: 'readonly',
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        location: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      ...localRules.rules,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },

  // 🎯 TypeScript 파일에 대한 기본 규칙
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // TypeScript 관련 규칙
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',

      // 기본 규칙 비활성화 (TypeScript 버전 사용)
      'no-unused-vars': 'off',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'off',

      // React 관련 규칙
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
      'react/function-component-definition': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // 🎯 팀 폴더에만 커스텀 규칙 적용
  {
    files: ['src/teams/team-*/**/*.{ts,tsx}'],
    rules: {
      // 🎯 커스텀 팀 아키텍처 규칙
      'local/restrict-team-imports': [
        'error',
        {
          allowedGlobalFolders: ['core', 'shared'],
          teamFolderPrefix: 'team-',
          teamsBasePath: 'src/teams',
        },
      ],
    },
  },

  // core와 shared 폴더는 제한 없음
  {
    files: ['src/core/**/*.{ts,tsx}', 'src/shared/**/*.{ts,tsx}'],
    rules: {
      'restrict-team-imports': 'off',
    },
  },

  // 테스트 파일은 제한 완화
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
    rules: {
      'restrict-team-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // 설정 파일들 제외
  {
    files: ['*.config.{js,ts}', 'eslint-rules/**/*.{js,ts}'],
    rules: {
      'restrict-team-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Next.js 특수 파일들
  {
    files: [
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
      'src/app/**/loading.tsx',
      'src/app/**/error.tsx',
      'src/app/**/not-found.tsx',
      'src/pages/**/*.tsx', // Pages Router
    ],
    rules: {
      'react/function-component-definition': 'off',
      'import/no-default-export': 'off',
    },
  },

  // 전역 무시 파일들
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.next/**',
      'coverage/**',
      '*.d.ts',
      'eslint-rules/**/*.test.{js,ts}',
      'eslint-rules/dist/**',
      '.history/**',
      'jest.config.mjs',
      'jest.setup.js',
    ],
  },
];
