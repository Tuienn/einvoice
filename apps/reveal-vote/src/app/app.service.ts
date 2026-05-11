/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { handlePrismaError } from '@libs/utils/handle-prisma-error.util'
import { COORDINATOR_MESSAGE_PATTERNS } from '@libs/constants/message-patterns.constant'
import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../infrastructure/prisma/prisma.service'
import { RevealVoteDto } from '@libs/types/reveal-vote/app.dto'
import {
    EcParams,
    SCALAR_BYTES,
    bytesToHex,
    hexToPoint,
    hexToScalar,
    scalarToBuffer,
    sha256,
    verify
} from '@libs/ec-schnorr'
import { CONFIGURATION } from '../configuration'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { buildVoteMessage } from '@libs/utils/build-vote-message.util'

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name)

    constructor(
        private readonly prisma: PrismaService,
        @Inject(`TCP_${CONFIGURATION.REVEAL_VOTE_CONFIG.COORDINATOR_TCP_NAME}`)
        private readonly coordinatorClient: ClientProxy
    ) {}

    private computeRevealKey(h: bigint, sPrime: bigint): string {
        const buf = new Uint8Array(SCALAR_BYTES * 2)
        buf.set(scalarToBuffer(h), 0)
        buf.set(scalarToBuffer(sPrime), SCALAR_BYTES)
        return bytesToHex(sha256(buf))
    }

    async revealVote(dto: RevealVoteDto, ecParams: EcParams) {
        //SECTION - Kiểm tra election
        const existElection = await lastValueFrom(
            this.coordinatorClient.send(COORDINATOR_MESSAGE_PATTERNS.GET_ELECTION_BY_ID, {
                id: dto.electionId
            })
        )

        if (existElection!.status === 'COMPLETED') {
            throw new ForbiddenException('Election is already completed')
        }

        if (existElection!.status !== 'CLOSED') {
            throw new ForbiddenException('Election is not closed')
        }

        if (!existElection!.collectivePublicKey) {
            throw new ConflictException('Election must has collectivePublicKey to reveal')
        }

        if (!existElection!.candidateIds.includes(dto.candidateId)) {
            throw new ForbiddenException('Candidate is not in the election')
        }

        const h = hexToScalar(dto.h)
        const sPrime = hexToScalar(dto.sPrime)
        const rho = hexToPoint(existElection!.collectivePublicKey, ecParams)

        //SECTION - Kiểm tra signature,  Đây là điểm tin cậy duy nhất: chữ ký tập thể chỉ có thể được tạo qua phiên blind sign hợp lệ.
        // Bind electionId vào message để chống cross-election replay: chữ ký
        // hợp lệ trong election A không verify được trong election B vì message
        // khác nhau. Client phải dùng cùng buildVoteMessage(electionId, candidateId)
        // ở pha blind.
        const messageBuf = buildVoteMessage(dto.electionId, dto.candidateId)
        const isValidSignature = verify(messageBuf, h, sPrime, ecParams, rho)

        if (!isValidSignature) {
            throw new BadRequestException('Invalid signature')
        }

        //SECTION - Tính blindedVoteHash
        const revealKey = this.computeRevealKey(h, sPrime)

        //SECTION - Kiểm tra blindedVoteHash có tồn tại trong database kchống anti-replay attack
        try {
            //NOTE - revealedVote có @@unique([electionId, revealKey]) đã đảm bảo auto validate chống replay
            const revealedVote = await this.prisma.revealedVote.create({
                data: {
                    electionId: dto.electionId,
                    candidateId: dto.candidateId,
                    revealKey,
                    signature: {
                        h: dto.h,
                        sPrime: dto.sPrime
                    }
                }
            })
            //SECTION - Auto-transition closed → completed khi mọi phiếu đã reveal
            const electionCompleted = await this.triggerCompleteIfAllRevealed(dto.electionId).catch((err) =>
                this.logger.error(`Auto-complete election ${dto.electionId} failed: ${err?.message}`)
            )

            return { ...revealedVote, electionCompleted }
        } catch (e) {
            handlePrismaError(e, [{ code: 'P2002', message: 'This vote has already been revealed' }])
        }
    }

    private async triggerCompleteIfAllRevealed(electionId: string): Promise<boolean> {
        const [revealCount, voteCount] = await Promise.all([
            this.prisma.revealedVote.count({ where: { electionId } }),
            lastValueFrom(
                this.coordinatorClient.send(COORDINATOR_MESSAGE_PATTERNS.GET_VOTE_COUNT, { id: electionId })
            ) as Promise<number>
        ])

        if (voteCount > 0 && revealCount >= voteCount) {
            await lastValueFrom(
                this.coordinatorClient.send(COORDINATOR_MESSAGE_PATTERNS.COMPLETE_ELECTION, { id: electionId })
            )
            this.logger.debug(`Election ${electionId} auto-completed: ${revealCount}/${voteCount} votes revealed`)

            return true
        }
        return false
    }
}
