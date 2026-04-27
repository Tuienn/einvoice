import { SetMetadata } from '@nestjs/common'
import { Role } from '@libs/types/identity/auth.type'

const ROLES_KEY = 'roles'
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)
