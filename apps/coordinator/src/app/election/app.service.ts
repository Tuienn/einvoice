import { removeUndefinedObj } from '@libs/utils/object.util'
import { PaginationMeta } from '@libs/types/common.type'
import { handlePrismaError } from '@libs/utils/handle-prisma-error.util'
import { MongoIdDto } from '@libs/types/common.dto'
import { CreateElectionDto, FilterElectionsDto, VoterIdsDto } from '@libs/types/coordinator/election.dto'
import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { Election, ElectionStatus } from '../../../generated/prisma/client'
import { CONFIGURATION } from '../../configuration'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { IDENTITY_MESSAGE_PATTERNS } from '@libs/constants/message-patterns.constant'

@Injectable()
export class AppService {
    constructor(
        @Inject(`TCP_${CONFIGURATION.COORDINATOR_CONFIG.IDENTITY_TCP_NAME}`)
        private readonly identityClient: ClientProxy,
        private readonly prisma: PrismaService
    ) {}

    async filterElections(dto: FilterElectionsDto): Promise<
        {
            data: Election[]
        } & PaginationMeta
    > {
        const { name, status, startDate, endDate, page = 0, pageSize = 10 } = dto ?? {}

        const [data, total] = await this.prisma.$transaction([
            this.prisma.election.findMany({
                where: removeUndefinedObj({
                    name: name ? { contains: name, mode: 'insensitive' } : undefined,
                    status: status ? { equals: status as ElectionStatus } : undefined,
                    startDate: startDate ? { gte: new Date(startDate) } : undefined,
                    endDate: endDate ? { lte: new Date(endDate) } : undefined
                }),
                orderBy: { createdAt: 'desc' },
                skip: page * pageSize,
                take: pageSize
            }),
            this.prisma.election.count()
        ])

        return {
            data,
            totalPages: Math.ceil(total / pageSize),
            currentPage: page,
            pageSize: pageSize,
            total
        }
    }

    async createElection(dto: CreateElectionDto) {
        //SECTION- Kiểm tra candidateIds có tồn tại và active không
        const candidates = await lastValueFrom(
            this.identityClient.send(IDENTITY_MESSAGE_PATTERNS.GET_USERS_BY_IDS, {
                ids: dto.candidateIds,
                role: 'CANDIDATE'
            })
        )

        const requestedUnique = [...new Set(dto.candidateIds)]
        const foundIds = new Set(candidates.map((c) => c.id))
        const missingIds = requestedUnique.filter((id) => !foundIds.has(id))

        if (missingIds.length > 0) {
            throw new BadRequestException(
                `Candidate IDs do not exist or are not users with role CANDIDATE: ${missingIds.join(', ')}`
            )
        }

        const inactiveIds = candidates.filter((c) => !c.isActive).map((c) => c.id)
        if (inactiveIds.length > 0) {
            throw new ConflictException(`Candidates must be active. Inactive IDs: ${inactiveIds.join(', ')}`)
        }

        return await this.prisma.election.create({
            data: {
                name: dto.name,
                candidateIds: dto.candidateIds
            }
        })
    }

    async addVotersToElection(dto: MongoIdDto & VoterIdsDto) {
        //SECTION- Kiểm tra voterIds có tồn tại và active không
        const voters = await lastValueFrom(
            this.identityClient.send(IDENTITY_MESSAGE_PATTERNS.GET_USERS_BY_IDS, {
                ids: dto.voterIds,
                role: 'VOTER'
            })
        )

        const requestedUnique = [...new Set(dto.voterIds)]
        const foundIds = new Set(voters.map((v) => v.id))
        const missingIds = requestedUnique.filter((id) => !foundIds.has(id))

        if (missingIds.length > 0) {
            throw new BadRequestException(
                `Voter IDs do not exist or are not users with role VOTER: ${missingIds.join(', ')}`
            )
        }

        const inactiveIds = voters.filter((v) => !v.isActive).map((v) => v.id)
        if (inactiveIds.length > 0) {
            throw new ConflictException(`Voters must be active. Inactive IDs: ${inactiveIds.join(', ')}`)
        }

        //SECTION- Thêm voters vào election
        try {
            return await this.prisma.$transaction(async (tx) => {
                const election = await tx.election.findUniqueOrThrow({
                    where: {
                        id: dto.id
                    }
                })

                if (election.status !== ElectionStatus.PENDING) {
                    throw new ConflictException('Only PENDING election can be added voters')
                }

                return await tx.election.update({
                    where: {
                        id: dto.id
                    },
                    data: {
                        electionVoters: {
                            createMany: {
                                data: dto.voterIds.map((voterId) => ({
                                    voterId
                                }))
                            }
                        }
                    },
                    include: {
                        electionVoters: true
                    }
                })
            })
        } catch (e) {
            handlePrismaError(e)
        }
    }

    async startElection(dto: MongoIdDto) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const election = await tx.election.findUniqueOrThrow({
                    where: {
                        id: dto.id
                    },
                    include: {
                        electionVoters: true
                    }
                })

                if (election.candidateIds.length < 2) {
                    throw new ConflictException('At least 2 candidates are required')
                }

                if (election.startDate) {
                    throw new ConflictException('Election already started')
                }

                if (election.status !== ElectionStatus.PENDING) {
                    throw new ConflictException('Only PENDING election can be started')
                }

                if (!election.electionVoters || election.electionVoters.length < 2) {
                    throw new ConflictException('At least 2 voters are required to start the election')
                }

                return await tx.election.update({
                    where: {
                        id: dto.id
                    },
                    data: {
                        status: ElectionStatus.ACTIVE,
                        startDate: new Date()
                    }
                })
            })
        } catch (e) {
            handlePrismaError(e)
        }
    }

    async endElection(dto: MongoIdDto) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const election = await tx.election.findUniqueOrThrow({
                    where: {
                        id: dto.id
                    }
                })

                if (!election.startDate) {
                    throw new ConflictException('Election not started')
                }

                if (election.endDate) {
                    throw new ConflictException('Election already ended')
                }
                if (election.status !== ElectionStatus.ACTIVE) {
                    throw new ConflictException('Only ACTIVE election can be ended')
                }
                return await tx.election.update({
                    where: {
                        id: dto.id
                    },
                    data: {
                        status: ElectionStatus.COMPLETED,
                        endDate: new Date()
                    }
                })
            })
        } catch (e) {
            handlePrismaError(e)
        }
    }

    async getElectionById(dto: MongoIdDto): Promise<Election> {
        try {
            return await this.prisma.election.findUniqueOrThrow({
                where: {
                    id: dto.id
                }
            })
        } catch (e) {
            handlePrismaError(e)
        }
    }
}
