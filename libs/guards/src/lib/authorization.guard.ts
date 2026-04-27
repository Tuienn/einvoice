import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '@libs/types/identity/auth.type'

const ROLES_KEY = 'roles'

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ])
        if (!requiredRoles) {
            return true
        }

        const contextType = context.getType()

        if (contextType === 'http') {
            const { user } = context.switchToHttp().getRequest()
            return requiredRoles.some((role) => user.roles?.includes(role))
        } else if (contextType === 'rpc') {
            const request = context.switchToRpc().getData()
            const user = request.user
            return requiredRoles.some((role) => user.roles?.includes(role))
        } else {
            throw new Error('Unsupported context type')
        }
    }
}
