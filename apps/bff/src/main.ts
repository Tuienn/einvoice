import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const globalPrefix = AppModule.CONFIGURATION.GLOBAL_PREFIX
    app.setGlobalPrefix(globalPrefix)
    app.useGlobalPipes(new ValidationPipe({ transform: true }))

    const swaggerConfig = new DocumentBuilder()
        .setTitle('BFF API')
        .setDescription('BFF API documentation')
        .setVersion('1.0')
        .addTag('bff')
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

    const port = AppModule.CONFIGURATION.PORT
    await app.listen(port)
    Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix} `)
    Logger.log(`🚀 Swagger documentation is running on: http://localhost:${port}/${globalPrefix}/docs `)

    const testConfig = AppModule.CONFIGURATION.BFF_CONFIG.TEST_CONFIG
    Logger.log(`🧪 Test Config: ${JSON.stringify(testConfig)}`)
}

bootstrap()
