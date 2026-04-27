import { Controller } from '@nestjs/common'
import { AppService } from './app.service'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { CreateVoterDto } from '@libs/types/identity/user.dto'
import { IDENTITY_MESSAGE_PATTERNS } from '@libs/constants/message-patterns.constant'
import { MongoIdDto } from '@libs/types/common.dto'
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @MessagePattern(IDENTITY_MESSAGE_PATTERNS.CREATE_VOTER)
    async createVoter(@Payload() dto: CreateVoterDto) {
        return await this.appService.createVoter(dto)
    }

    @MessagePattern(IDENTITY_MESSAGE_PATTERNS.GET_USER_BY_ID)
    async getUserById(@Payload() dto: MongoIdDto) {
        return await this.appService.getUserById(dto)
    }
}
