import { AUTH_TEXT } from '@libs/constants/text.constant'
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'

@Injectable()
export class AuthenticationGuard implements CanActivate {
    //NOTE - Guard này chỉ kiểm tra xem có userId trong payload đã giải mã hay không
    canActivate(context: ExecutionContext): boolean {
        const contextType = context.getType()

        if (contextType === 'http') {
            const request = context.switchToHttp().getRequest()
            const userId = request.user?.sub || request.headers['user-x-id'] //NOTE - Lấy userId từ payload đã giải mã hoặc từ header (dự phòng)

            if (!userId) {
                throw new UnauthorizedException(AUTH_TEXT.USER_ID_REQUIRED)
            }

            return true
        } else if (contextType === 'rpc') {
            const request = context.switchToRpc().getData()
            const userId = request.user?.sub

            if (!userId) {
                throw new UnauthorizedException(AUTH_TEXT.USER_ID_REQUIRED)
            }

            return true
        } else {
            throw new Error('Unsupported context type')
        }
    }
}
