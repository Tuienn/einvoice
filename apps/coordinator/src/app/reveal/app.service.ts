/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException
} from '@nestjs/common'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { RevealVoteDto } from '@libs/types/coordinator/reveal.dto'
import { AppService as ElectionService } from '../election/app.service'
import { ElectionStatus } from '../../../generated/prisma/enums'
import { EcParams, hashToScalar, hexToPoint, hexToScalar, scalarToBuffer, scalarToHex, verify } from '@libs/ec-schnorr'

@Injectable()
export class AppService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly electionService: ElectionService
    ) {}

    private async computeBlindedVoteHash(candidateId: string, h: bigint, sPrime: bigint, params: EcParams) {
        const messageBuf = Buffer.from(candidateId, 'utf8')
        const hBuf = scalarToBuffer(h)
        const sPrimeBuf = scalarToBuffer(sPrime)
        return scalarToHex(hashToScalar([messageBuf, hBuf, sPrimeBuf], params.n))
    }

    async revealVote(dto: RevealVoteDto, ecParams: EcParams) {
        //SECTION - Kiểm tra election
        const existElection = await this.electionService.getElectionById({ id: dto.electionId })
        const collectivePublicKey = await this.electionService.collectivePublicKey()

        if (existElection!.status !== 'CLOSED') {
            throw new ForbiddenException('Election is not closed')
        }

        if (collectivePublicKey !== existElection!.collectivePublicKey) {
            throw new ConflictException('Collective public key of election does not match with signing nodes param')
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

        //SECTION - Kiểm tra signature
        const messageBuf = Buffer.from(dto.candidateId, 'utf-8')
        const isValidSignature = verify(messageBuf, h, sPrime, ecParams, rho)

        if (!isValidSignature) {
            throw new BadRequestException('Invalid signature')
        }

        //SECTION - Tính blindedVoteHash
        const computedBlindedVoteHash = await this.computeBlindedVoteHash(dto.candidateId, h, sPrime, ecParams)

        //SECTION - Kiểm tra blindedVoteHash có tồn tại trong database kchống anti-replay attack
        const existVote = await this.prisma.revealedVote.findUnique({
            where: {
                electionId_blindedVoteHash: {
                    electionId: dto.electionId,
                    blindedVoteHash: computedBlindedVoteHash
                }
            }
        })

        if (existVote) {
            throw new ConflictException('Vote has already been revealed')
        }

        //SECTION - Kiểm tra vote có tồn tại trong bảng votes không
        const existSubmittedVote = await this.prisma.vote.findUnique({
            where: {
                electionId_blindedVoteHash: {
                    electionId: dto.electionId,
                    blindedVoteHash: computedBlindedVoteHash
                }
            }
        })

        if (!existSubmittedVote) {
            throw new NotFoundException('No corresponding submitted vote found for the revealed vote')
        }

        if (existSubmittedVote.revealed) {
            throw new ConflictException('This vote has already been revealed')
        }

        return await this.prisma.$transaction(async (tx) => {
            //SECTION - Lưu revealed vote vào database
            const revealedVote = await tx.revealedVote.create({
                data: {
                    electionId: dto.electionId,
                    candidateId: dto.candidateId,
                    blindedVoteHash: computedBlindedVoteHash,
                    signature: {
                        h: dto.h,
                        sPrime: dto.sPrime
                    }
                }
            })

            //SECTION - Cập nhật revealed = true cho vote đã được reveal
            await tx.vote.update({
                where: {
                    electionId_blindedVoteHash: {
                        electionId: dto.electionId,
                        blindedVoteHash: computedBlindedVoteHash
                    }
                },
                data: {
                    revealed: true
                }
            })

            //SECTION - Auto-transition closed → completed khi mọi phiếu đã reveal
            const remainingUnrevealedVote = await tx.vote.findFirst({
                where: {
                    electionId: dto.electionId,
                    revealed: false
                },
                select: { id: true }
            })

            if (!remainingUnrevealedVote) {
                await tx.election.update({
                    where: {
                        id: dto.electionId
                    },
                    data: {
                        status: ElectionStatus.COMPLETED
                    }
                })
            }

            return { ...revealedVote, electionCompleted: !remainingUnrevealedVote }
        })
    }
}
