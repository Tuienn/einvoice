import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { CONFIGURATION, TConfiguration } from '../configuration'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { HttpLoggerInterceptor } from '@libs/interceptors/logger.interceptor'
import { ExceptionInterceptor } from '@libs/interceptors/exception.interceptor'
import { TimeoutInterceptor } from '@libs/interceptors/timeout.interceptor'
import { TcpLoggerInterceptor } from '@libs/interceptors/tcp-logger.interceptor'

@Module({
    imports: [
        ConfigModule.forRoot({ load: [() => CONFIGURATION] })
        //NOTE- Tên định danh client TCP gọi và cấu hình options cho TCP service đích gọi đến
        // ClientsModule.register([
        //     {
        //         name: `TCP_${AppModule.CONFIGURATION.SERVICE_NAME}`,
        //         transport: Transport.TCP,
        //         options: {
        //             host: AppModule.CONFIGURATION.USER_CONFIG.TCP_HOST,
        //             port: AppModule.CONFIGURATION.USER_CONFIG.TCP_PORT
        //         }
        //     }
        // ])
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_INTERCEPTOR,
            useClass: HttpLoggerInterceptor
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TcpLoggerInterceptor
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ExceptionInterceptor
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TimeoutInterceptor
        }
    ]
})
export class AppModule {
    static CONFIGURATION: TConfiguration = CONFIGURATION
}
