import { ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { CacheInterceptor } from '@nestjs/cache-manager'
import { Observable } from 'rxjs'
import { CallHandler } from '@nestjs/common'

@Injectable()
export class TcpCacheInterceptor extends CacheInterceptor {
    private readonly logger = new Logger(TcpCacheInterceptor.name)

    override async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const key = this.trackBy(context)

        if (key) {
            const cached = await this.cacheManager.get(key)
            this.logger.log(cached ? `TCP Cache HIT — ${key}` : `TCP Cache MISS — ${key}`)
        }

        return super.intercept(context, next)
    }

    override trackBy(context: ExecutionContext): string | undefined {
        // TCP dùng RPC context thay vì HTTP context
        const rpcContext = context.switchToRpc()
        const data = rpcContext.getData() // payload từ client gửi lên
        const pattern = rpcContext.getContext().getPattern() // { cmd: 'get_user' }

        if (!pattern) return undefined

        const cmd = typeof pattern === 'string' ? pattern : (pattern?.cmd ?? JSON.stringify(pattern))

        // Tạo key từ pattern + payload
        // get_user:{"id":"123"} hoặc get_users (không có data)
        const dataStr = data && Object.keys(data).length ? `:${JSON.stringify(data)}` : ''

        const key = `${cmd}${dataStr}`
        this.logger.debug(`TCP Cache key: ${key}`)
        return key
    }
}
