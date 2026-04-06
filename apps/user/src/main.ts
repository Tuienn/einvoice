import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    //NOTE - Không sử dụng hàm NestFactory.createMicroservice vì muốn chạy cả HTTP server và TCP microservice trong cùng một ứng dụng NestJS, thay vì tách ra thành hai ứng dụng riêng biệt.
    app.connectMicroservice<MicroserviceOptions>(
        {
            transport: Transport.TCP,
            options: {
                host: AppModule.CONFIGURATION.USER_CONFIG.TCP_HOST,
                port: AppModule.CONFIGURATION.USER_CONFIG.TCP_PORT
            }
        },
        { inheritAppConfig: true } //NOTE - Kế thừa cấu hình từ app server, nếu không có flag này, TcpLoggerInterceptor được đăng ký trong app.module.ts sẽ không bao giờ chạy khi nhận TCP message
    )

    const globalPrefix = AppModule.CONFIGURATION.USER_CONFIG.HTTP_GLOBAL_PREFIX
    app.setGlobalPrefix(globalPrefix)
    app.useGlobalPipes(new ValidationPipe({ transform: true }))

    //NOTE - Khởi động microservices server để nhận TCP request.
    app.startAllMicroservices()
    Logger.log(
        `🚀 TCP microservice is running on: ${AppModule.CONFIGURATION.USER_CONFIG.TCP_HOST}:${AppModule.CONFIGURATION.USER_CONFIG.TCP_PORT} `
    )

    const swaggerConfig = new DocumentBuilder()
        .setTitle('User API')
        .setDescription('User API documentation')
        .setVersion('1.0')
        .addTag('user')
        .addBearerAuth({
            type: 'http',
            in: 'header',
            name: 'Authorization',
            scheme: 'bearer',
            bearerFormat: 'JWT'
        })
        .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup(`${globalPrefix}/docs`, app, document)

    const port = AppModule.CONFIGURATION.USER_CONFIG.HTTP_PORT
    await app.listen(port)

    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix} `)
    Logger.log(`🚀 Swagger documentation is running on: http://localhost:${port}/${globalPrefix}/docs `)
}

bootstrap()
