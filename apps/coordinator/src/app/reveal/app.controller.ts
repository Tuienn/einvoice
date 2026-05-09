import { BadRequestException, Controller } from '@nestjs/common'
import { AppService } from './app.service'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { RevealVoteDto } from '@libs/types/coordinator/reveal.dto'
import { COORDINATOR_MESSAGE_PATTERNS } from '@libs/constants/message-patterns.constant'
import { getParams, isValidScalarHex } from '@libs/ec-schnorr'
import { invalidDataField } from '@libs/constants/text.constant'

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @MessagePattern(COORDINATOR_MESSAGE_PATTERNS.REVEAL_VOTE)
    async revealVote(@Payload() dto: RevealVoteDto) {
        const ecParams = getParams()

        if (!isValidScalarHex(dto.h, ecParams.n) || !isValidScalarHex(dto.sPrime, ecParams.n)) {
            throw new BadRequestException(invalidDataField('h or sPrime'))
        }

        return await this.appService.revealVote(dto, ecParams)
    }
}
