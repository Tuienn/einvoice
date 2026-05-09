import { Module } from '@nestjs/common'
import { ElectionModule } from '../election/app.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
    imports: [ElectionModule],
    controllers: [AppController],
    providers: [AppService]
})
export class VoteModule {}
