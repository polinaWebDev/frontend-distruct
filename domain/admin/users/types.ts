import type { UserResponseDto } from '@/lib/api_client/gen/types.gen';

export type UserAdminRow = UserResponseDto & {
    points: number;
};
