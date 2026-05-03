import { TcpClientModule } from '@libs/modules/tcp-client.module'
import { CustomValidationPipe } from '@libs/pipes/custom-validation.pipe'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { CONFIGURATION } from '../configuration'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ExceptionFilterHandler } from '@libs/filters/exception.filter'
import { TimeoutInterceptor } from '@libs/interceptors/timeout.interceptor'
import { TcpLoggerInterceptor } from '@libs/interceptors/tcp-logger.interceptor'
import { HttpToRpcExceptionInterceptor } from '@libs/interceptors/http-to-rpc-exception.interceptor'
import { ElectionModule } from './election/app.module'
import { PrismaModule } from '../infrastructure/prisma/prisma.module'

@Module({
    imports: [
        ConfigModule.forRoot({ load: [() => CONFIGURATION] }),
        TcpClientModule.register([
            {
                serviceName: CONFIGURATION.COORDINATOR_CONFIG.IDENTITY_TCP_NAME,
                host: CONFIGURATION.COORDINATOR_CONFIG.IDENTITY_TCP_HOST,
                port: CONFIGURATION.COORDINATOR_CONFIG.IDENTITY_TCP_PORT
            }
        ]),
        PrismaModule,
        ElectionModule
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: HttpToRpcExceptionInterceptor
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TcpLoggerInterceptor
        },
        {
            provide: APP_FILTER,
            useClass: ExceptionFilterHandler
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TimeoutInterceptor
        },
        {
            provide: APP_PIPE,
            useClass: CustomValidationPipe
        }
    ]
})
export class AppModule {}
