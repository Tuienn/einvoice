import { Global, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Global()
@Module({
    controllers: [AppController],
    providers: [AppService],
    exports: [AppService]
})
export class CoordinatorModule {}
