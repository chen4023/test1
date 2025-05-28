// 📁 eslint-rules/index.ts
// TypeScript로 작성된 모든 커스텀 규칙을 한 곳에서 관리
import restrictTeamImports from './restrict-team-imports';
const localPlugin = {
  // 규칙들을 객체로 내보내기
  rules: {
    'restrict-team-imports': restrictTeamImports,
    // 나중에 추가할 규칙들
    // 'enforce-naming-convention': enforceNamingConvention,
    // 'restrict-external-deps': restrictExternalDeps,
  },
  // 미리 정의된 설정들
  configs: {
    // 권장 설정
    recommended: {
      rules: {
        'local/restrict-team-imports': 'error',
      },
    },
    // 엄격한 설정
    strict: {
      rules: {
        'local/restrict-team-imports': 'error',
      },
    },
    // 개발 환경 설정
    development: {
      rules: {
        'local/restrict-team-imports': 'warn', // 개발 중에는 경고만
      },
    },
  },
};
export default localPlugin;
