// 📁 eslint-rules/index.ts
// TypeScript로 작성된 모든 커스텀 규칙을 한 곳에서 관리

import type { ESLint } from 'eslint';
import restrictTeamImports from './restrict-team-imports';

// ESLint 플러그인 인터페이스
interface LocalESLintPlugin extends ESLint.Plugin {
  rules: Record<string, any>;
  configs: Record<string, ESLint.ConfigData>;
}

const localPlugin: LocalESLintPlugin = {
  // 규칙들을 객체로 내보내기
  rules: {
    'restric-team-imports': restrictTeamImports,
    // 나중에 추가할 규칙들
    // 'enforce-naming-convention': enforceNamingConvention,
    // 'restrict-external-deps': restrictExternalDeps,
  },

  // 미리 정의된 설정들
  configs: {
    // 권장 설정
    recommended: {
      rules: {
        'local/restric-team-imports': 'error',
      },
    },

    // 엄격한 설정
    strict: {
      rules: {
        'local/restric-team-imports': 'error',
      },
    },

    // 개발 환경 설정
    development: {
      rules: {
        'local/restric-team-imports': 'warn', // 개발 중에는 경고만
      },
    },
  },
};

export default localPlugin;
