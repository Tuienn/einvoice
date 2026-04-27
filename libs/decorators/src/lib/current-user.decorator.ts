// Decorator tiện lợi để lấy thông tin user từ header
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { RequestWithUser } from '@libs/types/identity/auth.type'

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestWithUser => {
    const contextType = ctx.getType()

    if (contextType === 'http') {
        const request = ctx.switchToHttp().getRequest()
        return {
            userId: Number(request.headers['user-x-id']),
            username: request.headers['x-user-email'],
            role: request.headers['x-user-role']
        }
    } else if (contextType === 'rpc') {
        const request = ctx.switchToRpc().getContext().getArgs()[0]
        return {
            userId: Number(request.headers['user-x-id']),
            username: request.headers['x-user-email'],
            role: request.headers['x-user-role']
        }
    } else {
        throw new Error('Unsupported context type')
    }
})
