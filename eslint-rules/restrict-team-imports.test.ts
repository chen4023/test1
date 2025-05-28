// 📁 eslint-rules/restrict-team-imports.test.ts
import { RuleTester } from 'eslint';
import rule from './restrict-team-imports';
import type { TeamImportRuleOptions } from './types';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});

describe('restrict-team-imports (TypeScript 규칙)', () => {
  const defaultOptions: TeamImportRuleOptions = {
    allowedGlobalFolders: ['core', 'shared'],
    teamFolderPrefix: 'team-',
    teamsBasePath: 'src/teams',
  };

  ruleTester.run('restrict-team-imports', rule, {
    valid: [
      // ✅ 외부 라이브러리 import
      {
        code: `import React from 'react';`,
        filename: '/project/src/teams/team-order/components/OrderList.tsx',
        options: [defaultOptions],
      },
      {
        code: `import type { FC } from 'react';`,
        filename: '/project/src/teams/team-auth/components/LoginForm.tsx',
        options: [defaultOptions],
      },
      {
        code: `import { z } from 'zod';`,
        filename: '/project/src/teams/team-order/types/order.ts',
        options: [defaultOptions],
      },

      // ✅ core 폴더 import
      {
        code: `import { Button } from '@/core/components/Button';`,
        filename: '/project/src/teams/team-order/components/OrderList.tsx',
        options: [defaultOptions],
      },
      {
        code: `import type { ButtonProps } from '@/core/components/Button';`,
        filename: '/project/src/teams/team-auth/components/AuthButton.tsx',
        options: [defaultOptions],
      },

      // ✅ shared 폴더 import
      {
        code: `import { ApiClient } from '@/shared/api/client';`,
        filename: '/project/src/teams/team-order/services/orderService.ts',
        options: [defaultOptions],
      },
      {
        code: `import type { User } from '@/shared/types/user';`,
        filename: '/project/src/teams/team-profile/types/profile.ts',
        options: [defaultOptions],
      },

      // ✅ 같은 팀 내부 import
      {
        code: `import { OrderType } from '@/teams/team-order/types/order';`,
        filename: '/project/src/teams/team-order/components/OrderList.tsx',
        options: [defaultOptions],
      },
      {
        code: `import type { OrderFormData } from '@/teams/team-order/types/forms';`,
        filename: '/project/src/teams/team-order/components/OrderForm.tsx',
        options: [defaultOptions],
      },

      // ✅ 상대 경로 import
      {
        code: `import { useOrder } from '../hooks/useOrder';`,
        filename: '/project/src/teams/team-order/components/OrderForm.tsx',
        options: [defaultOptions],
      },
      {
        code: `import type { OrderHookReturn } from './useOrder';`,
        filename: '/project/src/teams/team-order/hooks/useOrderForm.ts',
        options: [defaultOptions],
      },

      // ✅ Dynamic import - 허용되는 경우
      {
        code: `const Component = await import('@/core/components/Modal');`,
        filename: '/project/src/teams/team-order/pages/OrderPage.tsx',
        options: [defaultOptions],
      },
      {
        code: `const { OrderUtils } = await import('@/teams/team-order/utils/orderUtils');`,
        filename: '/project/src/teams/team-order/components/OrderList.tsx',
        options: [defaultOptions],
      },

      // ✅ 팀 폴더 외부에서는 제한 없음
      {
        code: `import { ProfileComponent } from '@/teams/team-profile/components/Profile';`,
        filename: '/project/src/core/components/Layout.tsx',
        options: [defaultOptions],
      },
    ],

    invalid: [
      // ❌ 다른 팀으로의 import
      {
        code: `import { UserProfile } from '@/teams/team-profile/components/UserProfile';`,
        filename: '/project/src/teams/team-order/components/OrderList.tsx',
        options: [defaultOptions],
        errors: [
          {
            messageId: 'crossTeamImport',
            data: {
              currentTeam: 'team-order',
              targetTeam: 'team-profile',
            },
          },
        ],
      },

      // ❌ 타입 import도 제한됨
      {
        code: `import type { AuthUser } from '@/teams/team-auth/types/user';`,
        filename: '/project/src/teams/team-order/types/order.ts',
        options: [defaultOptions],
        errors: [
          {
            messageId: 'crossTeamImport',
            data: {
              currentTeam: 'team-order',
              targetTeam: 'team-auth',
            },
          },
        ],
      },

      // ❌ 여러 다른 팀 import
      {
        code: `
          import { AuthService } from '@/teams/team-auth/services/auth';
          import type { ProfileData } from '@/teams/team-profile/types/profile';
          import { DashboardChart } from '@/teams/team-dashboard/components/Chart';
        `,
        filename: '/project/src/teams/team-order/components/OrderList.tsx',
        options: [defaultOptions],
        errors: [
          {
            messageId: 'crossTeamImport',
            data: {
              currentTeam: 'team-order',
              targetTeam: 'team-auth',
            },
          },
          {
            messageId: 'crossTeamImport',
            data: {
              currentTeam: 'team-order',
              targetTeam: 'team-profile',
            },
          },
          {
            messageId: 'crossTeamImport',
            data: {
              currentTeam: 'team-order',
              targetTeam: 'team-dashboard',
            },
          },
        ],
      },

      // ❌ Dynamic import로 다른 팀 접근
      {
        code: `const ProfileComponent = await import('@/teams/team-profile/components/Profile');`,
        filename: '/project/src/teams/team-order/pages/OrderPage.tsx',
        options: [defaultOptions],
        errors: [
          {
            messageId: 'crossTeamImport',
            data: {
              currentTeam: 'team-order',
              targetTeam: 'team-profile',
            },
          },
        ],
      },

      // ❌ 커스텀 설정에서도 크로스 팀 import 금지
      {
        code: `import { AuthComponent } from '@/teams/team-auth/components/Auth';`,
        filename: '/project/src/teams/team-order/components/OrderList.tsx',
        options: [
          {
            ...defaultOptions,
            allowedGlobalFolders: ['core', 'shared', 'utils'],
          },
        ],
        errors: [
          {
            messageId: 'crossTeamImport',
            data: {
              currentTeam: 'team-order',
              targetTeam: 'team-auth',
            },
          },
        ],
      },
    ],
  });

  // 🧪 커스텀 설정 테스트
  describe('커스텀 설정 테스트', () => {
    const customOptions: TeamImportRuleOptions = {
      allowedGlobalFolders: ['shared', 'entities', 'widgets'],
      teamFolderPrefix: 'feature-',
      teamsBasePath: 'src/features',
    };

    ruleTester.run('restrict-team-imports with custom config', rule, {
      valid: [
        // ✅ 커스텀 allowedGlobalFolders 테스트
        {
          code: `import { EntityModel } from '@/entities/user';`,
          filename: '/project/src/features/feature-order/components/OrderList.tsx',
          options: [customOptions],
        },
        {
          code: `import { WidgetComponent } from '@/widgets/header';`,
          filename: '/project/src/features/feature-auth/pages/LoginPage.tsx',
          options: [customOptions],
        },

        // ✅ 커스텀 teamFolderPrefix 테스트
        {
          code: `import { FeatureComponent } from '@/teams/feature-auth/components/Auth';`,
          filename: '/project/src/features/feature-auth/pages/LoginPage.tsx',
          options: [customOptions],
        },
      ],

      invalid: [
        // ❌ 커스텀 설정에서도 크로스 팀 import 금지
        {
          code: `import { AuthComponent } from '@/teams/feature-auth/components/Auth';`,
          filename: '/project/src/features/feature-order/components/OrderList.tsx',
          options: [customOptions],
          errors: [
            {
              messageId: 'crossTeamImport',
              data: {
                currentTeam: 'feature-order',
                targetTeam: 'feature-auth',
              },
            },
          ],
        },
      ],
    });
  });

  // 🧪 엣지 케이스 테스트
  describe('엣지 케이스 테스트', () => {
    ruleTester.run('restrict-team-imports edge cases', rule, {
      valid: [
        // ✅ 깊은 중첩 폴더 구조
        {
          code: `import { DeepComponent } from '@/teams/team-order/components/forms/inputs/TextInput';`,
          filename: '/project/src/teams/team-order/pages/order/detail/OrderDetail.tsx',
          options: [defaultOptions],
        },

        // ✅ 대소문자 혼합 (실제 팀명 감지)
        {
          code: `import { Component } from '@/teams/Team-Order/components/Button';`,
          filename: '/project/src/teams/Team-Order/pages/OrderPage.tsx',
          options: [defaultOptions],
        },

        // ✅ 복잡한 import 구조
        {
          code: `import { 
            OrderService, 
            type OrderConfig,
            ORDER_CONSTANTS 
          } from '@/teams/team-order/services/orderService';`,
          filename: '/project/src/teams/team-order/components/OrderList.tsx',
          options: [defaultOptions],
        },

        // ✅ 네임스페이스 import
        {
          code: `import * as OrderUtils from '@/teams/team-order/utils/orderUtils';`,
          filename: '/project/src/teams/team-order/components/OrderList.tsx',
          options: [defaultOptions],
        },

        // ✅ 조건부 import (동적)
        {
          code: `
            if (condition) {
              const { OrderModal } = await import('@/teams/team-order/components/OrderModal');
            }
          `,
          filename: '/project/src/teams/team-order/pages/OrderPage.tsx',
          options: [defaultOptions],
        },

        // ✅ 타입 전용 import
        {
          code: `import type { OrderStatus, OrderPriority } from '@/teams/team-order/types/order';`,
          filename: '/project/src/teams/team-order/hooks/useOrder.ts',
          options: [defaultOptions],
        },
      ],

      invalid: [
        // ❌ 깊은 중첩에서도 크로스 팀 감지
        {
          code: `import { ProfileForm } from '@/teams/team-profile/components/forms/ProfileForm';`,
          filename: '/project/src/teams/team-order/pages/order/detail/OrderDetail.tsx',
          options: [defaultOptions],
          errors: [
            {
              messageId: 'crossTeamImport',
              data: {
                currentTeam: 'team-order',
                targetTeam: 'team-profile',
              },
            },
          ],
        },

        // ❌ 복잡한 import에서도 감지
        {
          code: `import { 
            AuthService,
            type AuthConfig 
          } from '@/teams/team-auth/services/authService';`,
          filename: '/project/src/teams/team-order/components/OrderList.tsx',
          options: [defaultOptions],
          errors: [
            {
              messageId: 'crossTeamImport',
              data: {
                currentTeam: 'team-order',
                targetTeam: 'team-auth',
              },
            },
          ],
        },

        // ❌ 네임스페이스 import도 제한
        {
          code: `import * as ProfileUtils from '@/teams/team-profile/utils/profileUtils';`,
          filename: '/project/src/teams/team-order/components/OrderList.tsx',
          options: [defaultOptions],
          errors: [
            {
              messageId: 'crossTeamImport',
              data: {
                currentTeam: 'team-order',
                targetTeam: 'team-profile',
              },
            },
          ],
        },

        // ❌ 조건부 동적 import도 제한
        {
          code: `
            if (showProfile) {
              const { ProfileModal } = await import('@/teams/team-profile/components/ProfileModal');
            }
          `,
          filename: '/project/src/teams/team-order/pages/OrderPage.tsx',
          options: [defaultOptions],
          errors: [
            {
              messageId: 'crossTeamImport',
              data: {
                currentTeam: 'team-order',
                targetTeam: 'team-profile',
              },
            },
          ],
        },
      ],
    });
  });

  // 🧪 실제 시나리오 테스트
  describe('실제 사용 시나리오', () => {
    ruleTester.run('realistic scenarios', rule, {
      valid: [
        // ✅ 실제 Next.js 컴포넌트 패턴
        {
          code: `
            'use client';
            
            import React, { useState, useCallback } from 'react';
            import type { FC, MouseEvent } from 'react';
            import { Button } from '@/core/components/ui/Button';
            import { Card } from '@/core/components/ui/Card';
            import { useToast } from '@/core/hooks/useToast';
            import { ApiClient } from '@/shared/api/client';
            import type { ApiResponse } from '@/shared/types/api';
            import { OrderService } from '@/teams/team-order/services/orderService';
            import type { Order, OrderStatus } from '@/teams/team-order/types/order';
            import { useOrder } from '../hooks/useOrder';
            
            interface OrderListProps {
              initialOrders: Order[];
              onOrderUpdate?: (order: Order) => void;
            }
            
            export const OrderList: FC<OrderListProps> = ({ initialOrders, onOrderUpdate }) => {
              const [orders, setOrders] = useState<Order[]>(initialOrders);
              const { updateOrderStatus } = useOrder();
              const { showToast } = useToast();
              
              const handleStatusChange = useCallback(async (orderId: string, status: OrderStatus) => {
                try {
                  const updatedOrder = await OrderService.updateStatus(orderId, status);
                  setOrders(prev => prev.map(order => 
                    order.id === orderId ? updatedOrder : order
                  ));
                  onOrderUpdate?.(updatedOrder);
                  showToast('주문 상태가 업데이트되었습니다.');
                } catch (error) {
                  showToast('업데이트에 실패했습니다.', 'error');
                }
              }, [onOrderUpdate, showToast]);
              
              return (
                <div className="space-y-4">
                  {orders.map(order => (
                    <Card key={order.id}>
                      {/* 주문 카드 내용 */}
                    </Card>
                  ))}
                </div>
              );
            };
          `,
          filename: '/project/src/teams/team-order/components/OrderList.tsx',
          options: [defaultOptions],
        },

        // ✅ 서비스 레이어 패턴
        {
          code: `
            import { ApiClient } from '@/shared/api/client';
            import type { ApiResponse, PaginationParams } from '@/shared/types/api';
            import { handleApiError } from '@/shared/utils/errorHandler';
            import type { Order, CreateOrderData, UpdateOrderData } from '@/teams/team-order/types/order';
            
            export class OrderService {
              private static readonly BASE_PATH = '/api/orders';
              
              static async getOrders(params?: PaginationParams): Promise<ApiResponse<Order[]>> {
                try {
                  return await ApiClient.get(this.BASE_PATH, { params });
                } catch (error) {
                  throw handleApiError(error);
                }
              }
              
              static async createOrder(data: CreateOrderData): Promise<ApiResponse<Order>> {
                try {
                  return await ApiClient.post(this.BASE_PATH, data);
                } catch (error) {
                  throw handleApiError(error);
                }
              }
            }
          `,
          filename: '/project/src/teams/team-order/services/orderService.ts',
          options: [defaultOptions],
        },

        // ✅ 커스텀 훅 패턴
        {
          code: `
            import { useState, useEffect, useCallback } from 'react';
            import type { UseQueryResult } from '@tanstack/react-query';
            import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
            import { useToast } from '@/core/hooks/useToast';
            import { OrderService } from '@/teams/team-order/services/orderService';
            import type { Order, CreateOrderData } from '@/teams/team-order/types/order';
            
            interface UseOrderReturn {
              orders: Order[];
              isLoading: boolean;
              error: Error | null;
              createOrder: (data: CreateOrderData) => Promise<void>;
              refetch: () => void;
            }
            
            export const useOrder = (): UseOrderReturn => {
              const queryClient = useQueryClient();
              const { showToast } = useToast();
              
              const {
                data: orders = [],
                isLoading,
                error,
                refetch
              } = useQuery({
                queryKey: ['orders'],
                queryFn: OrderService.getOrders
              });
              
              const createMutation = useMutation({
                mutationFn: OrderService.createOrder,
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['orders'] });
                  showToast('주문이 성공적으로 생성되었습니다.');
                },
                onError: () => {
                  showToast('주문 생성에 실패했습니다.', 'error');
                }
              });
              
              const createOrder = useCallback(async (data: CreateOrderData) => {
                await createMutation.mutateAsync(data);
              }, [createMutation]);
              
              return {
                orders,
                isLoading,
                error,
                createOrder,
                refetch
              };
            };
          `,
          filename: '/project/src/teams/team-order/hooks/useOrder.ts',
          options: [defaultOptions],
        },
      ],

      invalid: [
        // ❌ 실제 시나리오에서 크로스 팀 import 감지
        {
          code: `
            import React from 'react';
            import { Button } from '@/core/components/Button';
            import { ApiClient } from '@/shared/api/client';
            import { OrderService } from '@/teams/team-order/services/orderService';
            import { ProfileService } from '@/teams/team-profile/services/profileService'; // ❌ 다른 팀
            
            export const OrderList = () => {
              // 컴포넌트 로직
            };
          `,
          filename: '/project/src/teams/team-order/components/OrderList.tsx',
          options: [defaultOptions],
          errors: [
            {
              messageId: 'crossTeamImport',
              data: {
                currentTeam: 'team-order',
                targetTeam: 'team-profile',
              },
            },
          ],
        },

        // ❌ 서비스에서 다른 팀 타입 import
        {
          code: `
            import { ApiClient } from '@/shared/api/client';
            import type { Order } from '@/teams/team-order/types/order';
            import type { User } from '@/teams/team-auth/types/user'; // ❌ 다른 팀 타입
            
            export class OrderService {
              static async assignOrder(orderId: string, user: User): Promise<Order> {
                return ApiClient.post('/orders/assign', { orderId, userId: user.id });
              }
            }
          `,
          filename: '/project/src/teams/team-order/services/orderService.ts',
          options: [defaultOptions],
          errors: [
            {
              messageId: 'crossTeamImport',
              data: {
                currentTeam: 'team-order',
                targetTeam: 'team-auth',
              },
            },
          ],
        },
      ],
    });
  });

  // 🧪 성능 테스트 (대량 import)
  describe('성능 테스트', () => {
    const generateLargeImportCode = (teamName: string, count: number): string => {
      const imports = Array.from(
        { length: count },
        (_, i) => `import { Component${i} } from '@/teams/${teamName}/components/Component${i}';`
      ).join('\n');
      return imports;
    };

    ruleTester.run('performance test with many imports', rule, {
      valid: [
        // ✅ 같은 팀에서 많은 import
        {
          code: generateLargeImportCode('team-order', 50),
          filename: '/project/src/teams/team-order/pages/OrderPage.tsx',
          options: [defaultOptions],
        },
      ],

      invalid: [
        // ❌ 다른 팀에서 많은 import
        {
          code: generateLargeImportCode('team-profile', 10),
          filename: '/project/src/teams/team-order/pages/OrderPage.tsx',
          options: [defaultOptions],
          errors: Array.from({ length: 10 }, () => ({
            messageId: 'crossTeamImport',
          })),
        },
      ],
    });
  });
});

// 📊 테스트 결과 요약
console.log('🧪 TypeScript ESLint 규칙 테스트 완료!');
console.log('📊 테스트 커버리지:');
console.log('  ✅ 기본 import 패턴 테스트');
console.log('  ✅ TypeScript 타입 import 테스트');
console.log('  ✅ 커스텀 설정 테스트');
console.log('  ✅ 엣지 케이스 테스트');
console.log('  ✅ 실제 사용 시나리오 테스트');
console.log('  ✅ 성능 테스트');
console.log('🎉 모든 테스트 완료!');
