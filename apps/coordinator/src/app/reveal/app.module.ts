import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ElectionModule } from '../election/app.module'

@Module({
    imports: [ElectionModule],
    controllers: [AppController],
    providers: [AppService]
})
export class RevealModule {}
