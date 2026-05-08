/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { RevealVoteDto } from '@libs/types/coordinator/reveal.dto'
import { AppService as ElectionService } from '../election/app.service'
import { BN, verify } from '@libs/schnorr-blind'

@Injectable()
export class AppService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly electionService: ElectionService
    ) {}

    async revealVote(dto: RevealVoteDto) {
        //SECTION- Kiểm tra election
        const existElection = await this.electionService.getElectionById({ id: dto.electionId })

        if (existElection!.status !== 'CLOSED') {
            throw new ForbiddenException('Election is not closed')
        }

        if (!existElection!.collectivePublicKey) {
            throw new ConflictException('Election must has collectivePublicKey to reveal')
        }

        if (!existElection!.candidateIds.includes(dto.candidateId)) {
            throw new ForbiddenException('Candidate is not in the election')
        }

        const hBN = new BN(dto.h, 16)
        const sPrimeBN = new BN(dto.sPrime, 16)
        const rho = new BN(existElection!.collectivePublicKey, 16)

        //SECTION - Kiểm tra signature
        const messageBuf = Buffer.from(dto.candidateId, 'utf-8')
        // const isValidSignature = verify(dto.candidateId, hBN, sPrimeBN)
    }
}
