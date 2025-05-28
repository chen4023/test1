// 📁 jest.config.js
export default {
  // TypeScript 지원
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",

  // 테스트 파일 패턴
  testMatch: [
    "**/tests/**/*.test.{js,ts}",
    "**/eslint-rules/**/*.test.{js,ts}",
    "**/__tests__/**/*.{js,ts}",
    "**/*.(test|spec).{js,ts}",
  ],

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./eslint-rules/tsconfig.json",
      },
    ],
  },

  moduleNameMapper: {
    "^@/(.*)": "<rootDir>/src/$1",
  },

  // ES 모듈 처리
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // 커버리지 설정
  collectCoverageFrom: [
    "eslint-rules/**/*.{js,ts}",
    "src/**/*.{js,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{js,ts,tsx}",
    "!src/**/*.spec.{js,ts,tsx}",
    "!src/**/__tests__/**",
    "!eslint-rules/**/*.test.{js,ts}",
    "!eslint-rules/dist/**",
  ],

  // 커버리지 리포터
  coverageReporters: ["text", "text-summary", "lcov", "html"],

  // 커버리지 임계값
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    "./eslint-rules/": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  // 무시할 파일들
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/build/",
    "/.next/",
    "/coverage/",
    "/temp/",
  ],

  // 설정 파일들
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // 타임아웃 설정
  testTimeout: 10000,

  // 상세한 출력
  verbose: true,

  // 병렬 실행
  maxWorkers: "50%",

  // 캐시 설정
  cache: true,
  cacheDirectory: "<rootDir>/.jest-cache",
};

// 📁 jest.setup.js
// Jest 전역 설정

// 콘솔 출력 개선
const originalConsoleError = console.error;
console.error = (...args) => {
  // ESLint 관련 에러는 무시 (테스트 중 예상된 에러)
  if (
    args[0] &&
    typeof args[0] === "string" &&
    args[0].includes("Cross-team import detected")
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// 테스트 환경 변수 설정
process.env.NODE_ENV = "test";

// 타임존 설정
process.env.TZ = "UTC";

// 전역 테스트 설정
global.testTimeout = 5000;

console.log("🧪 Jest 테스트 환경 설정 완료");
