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
import { BN, bnToBuffer, getByteLength, hashToBN, verify } from '@libs/schnorr-blind'
import { ElectionStatus } from '../../../generated/prisma/enums'

@Injectable()
export class AppService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly electionService: ElectionService
    ) {}

    private async computeBlindedVoteHash(candidateId: string, hBN: BN, sPrimeBN: BN, pBN: BN, qBN: BN) {
        const byteLen = getByteLength(pBN)
        const messageBuf = Buffer.from(candidateId, 'utf8')
        const hBuf = bnToBuffer(hBN, byteLen)
        const sPrimeBuf = bnToBuffer(sPrimeBN, byteLen)
        return hashToBN([messageBuf, hBuf, sPrimeBuf], qBN).toString(16)
    }

    async revealVote(dto: RevealVoteDto) {
        //SECTION - Kiểm tra election
        const existElection = await this.electionService.getElectionById({ id: dto.electionId })
        const signingNodesParam = await this.electionService.collectiveSigningNodesParam()

        if (existElection!.status !== 'CLOSED') {
            throw new ForbiddenException('Election is not closed')
        }

        if (signingNodesParam.collectivePublicKey !== existElection!.collectivePublicKey) {
            throw new ConflictException('Collective public key of election does not match with signing nodes param')
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
        const pBN = new BN(signingNodesParam.p, 16)
        const qBN = new BN(signingNodesParam.q, 16)
        const gBN = new BN(signingNodesParam.g, 16)

        //SECTION - Kiểm tra signature
        const messageBuf = Buffer.from(dto.candidateId, 'utf-8')
        const isValidSignature = verify(messageBuf, hBN, sPrimeBN, pBN, qBN, gBN, rho)

        if (!isValidSignature) {
            throw new BadRequestException('Invalid signature')
        }

        //SECTION - Tính blindedVoteHash
        const computedBlindedVoteHash = await this.computeBlindedVoteHash(dto.candidateId, hBN, sPrimeBN, pBN, qBN)

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
