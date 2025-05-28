// 📁 eslint-rules/restrict-team-imports.ts - 가장 안전한 버전
import type { Rule } from 'eslint';
import type { ImportDeclaration, ImportExpression, Literal } from 'estree';

// 기본 옵션을 상수로 정의
const DEFAULT_OPTIONS = {
  allowedGlobalFolders: ['core', 'shared'],
  teamFolderPrefix: 'team-',
  teamsBasePath: 'src/teams',
} as const;

interface ImportAnalysis {
  type: 'external' | 'relative' | 'global' | 'team' | 'restricted' | 'unknown';
  folder: string | null;
  team: string | null;
  description?: string;
}

const restrictTeamImports: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Restrict imports between team folders to maintain clean architecture',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedGlobalFolders: {
            type: 'array',
            items: { type: 'string' },
            default: DEFAULT_OPTIONS.allowedGlobalFolders,
          },
          teamFolderPrefix: {
            type: 'string',
            default: DEFAULT_OPTIONS.teamFolderPrefix,
          },
          teamsBasePath: {
            type: 'string',
            default: DEFAULT_OPTIONS.teamsBasePath,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      crossTeamImport:
        '❌ Cross-team import detected!\n   Current team: "{{currentTeam}}"\n   Trying to import from: "{{targetTeam}}"\n   🚫 Teams cannot import from each other to maintain clean architecture.',
      restrictedImport:
        '❌ Restricted import detected!\n   Current team: "{{currentTeam}}"\n   Trying to import: "{{importPath}}"\n   ✅ Allowed imports: {{allowedPaths}}',
    },
  },

  create(context) {
    // 옵션 추출 - TypeScript가 자동으로 타입을 추론
    const userOptions = context.options[0];
    const options = {
      allowedGlobalFolders:
        userOptions?.allowedGlobalFolders ?? DEFAULT_OPTIONS.allowedGlobalFolders,
      teamFolderPrefix: userOptions?.teamFolderPrefix ?? DEFAULT_OPTIONS.teamFolderPrefix,
      teamsBasePath: userOptions?.teamsBasePath ?? DEFAULT_OPTIONS.teamsBasePath,
    };

    const { allowedGlobalFolders, teamFolderPrefix, teamsBasePath } = options;

    /**
     * 파일 경로에서 현재 팀 자동 감지
     */
    function detectCurrentTeam(filePath: string): string | null {
      const normalizedPath = filePath.replace(/\\\\/g, '/');
      const pathSegments = normalizedPath.split('/');

      const teamsIndex = pathSegments.findIndex(
        (segment) => segment === 'teams' || normalizedPath.includes(teamsBasePath)
      );

      if (teamsIndex === -1) {
        return null;
      }

      for (let i = teamsIndex + 1; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        if (segment.startsWith(teamFolderPrefix)) {
          return segment;
        }
      }

      return null;
    }

    /**
     * Import 경로 자동 분석
     */
    function analyzeImportPath(importPath: string): ImportAnalysis {
      // 외부 라이브러리
      if (
        !importPath.startsWith('./') &&
        !importPath.startsWith('../') &&
        !importPath.startsWith('@/')
      ) {
        return {
          type: 'external',
          folder: null,
          team: null,
          description: 'External library',
        };
      }

      // 상대 경로
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        return {
          type: 'relative',
          folder: null,
          team: null,
          description: 'Relative path (same team)',
        };
      }

      // 절대 경로 (@/)
      if (importPath.startsWith('@/')) {
        const cleanPath = importPath.replace('@/', '');
        const segments = cleanPath.split('/');
        const firstSegment = segments[0];

        // 전역 허용 폴더들
        if (allowedGlobalFolders.includes(firstSegment)) {
          return {
            type: 'global',
            folder: firstSegment,
            team: null,
            description: `Global ${firstSegment} folder`,
          };
        }

        // teams 폴더 내부
        if (firstSegment === 'teams' && segments[1]) {
          const teamName = segments[1];
          if (teamName.startsWith(teamFolderPrefix)) {
            return {
              type: 'team',
              folder: teamName,
              team: teamName,
              description: `Team folder: ${teamName}`,
            };
          }
        }

        // 기타 폴더
        return {
          type: 'restricted',
          folder: firstSegment,
          team: null,
          description: `Restricted folder: ${firstSegment}`,
        };
      }

      return {
        type: 'unknown',
        folder: null,
        team: null,
        description: 'Unknown import type',
      };
    }

    /**
     * Import 허용 여부 자동 판단
     */
    function isImportAllowed(currentTeam: string, importInfo: ImportAnalysis): boolean {
      const { type, team: targetTeam } = importInfo;

      switch (type) {
        case 'external':
        case 'relative':
        case 'global':
          return true;
        case 'team':
          return targetTeam === currentTeam;
        case 'restricted':
        case 'unknown':
        default:
          return false;
      }
    }

    /**
     * 허용된 Import 경로 목록 생성
     */
    function getAllowedPaths(currentTeam: string): string {
      const paths = [
        `@/teams/${currentTeam}/*`,
        ...allowedGlobalFolders.map((folder: string) => `@/${folder}/*`),
        'External libraries (react, lodash, etc.)',
        'Relative paths (./, ../)',
      ];
      return paths.join('\n   ✅ ');
    }

    /**
     * Import 소스가 문자열 리터럴인지 확인
     */
    function isStringLiteral(source: unknown): source is Literal & { value: string } {
      return (
        source !== null &&
        typeof source === 'object' &&
        'type' in source &&
        source.type === 'Literal' &&
        'value' in source &&
        typeof source.value === 'string'
      );
    }

    /**
     * Import 검사 및 에러 리포트
     */
    function checkImport(node: ImportDeclaration | ImportExpression): void {
      const currentFile = context.getFilename();
      const currentTeam = detectCurrentTeam(currentFile);

      if (!currentTeam) {
        return;
      }

      // 소스 노드 추출
      const source = 'source' in node ? node.source : null;
      if (!isStringLiteral(source)) {
        return;
      }

      const importPath = source.value;
      const importInfo = analyzeImportPath(importPath);

      if (!isImportAllowed(currentTeam, importInfo)) {
        const { type, team: targetTeam } = importInfo;

        if (type === 'team') {
          context.report({
            node: source,
            messageId: 'crossTeamImport',
            data: {
              currentTeam,
              targetTeam: targetTeam ?? 'unknown',
              importPath,
            },
          });
        } else {
          context.report({
            node: source,
            messageId: 'restrictedImport',
            data: {
              currentTeam,
              importPath,
              allowedPaths: getAllowedPaths(currentTeam),
            },
          });
        }
      }
    }

    return {
      ImportDeclaration: checkImport,
      ImportExpression: checkImport,
    };
  },
};

export default restrictTeamImports;
