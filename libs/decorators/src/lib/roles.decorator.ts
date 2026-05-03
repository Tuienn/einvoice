import { SetMetadata } from '@nestjs/common'
import { ROLE_ARRAY, ROLES_KEY } from '@libs/constants/common.constant'

export const Roles = (...roles: typeof ROLE_ARRAY) => SetMetadata(ROLES_KEY, roles)
