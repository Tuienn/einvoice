import { removeUndefinedObj } from '@libs/utils/object.util'
import { Injectable } from '@nestjs/common'
import {
    CreateBulkVotersDto,
    CreateVoterDto,
    FilterUsersDto,
    GetUserByEmailDto,
    UpdateUserByIdDto
} from '@libs/types/identity/user.dto'
import { handlePrismaError } from '@libs/utils/handle-prisma-error.util'
import { PrismaService } from '../../infrastructure/prisma/prisma.service'
import { hash } from 'argon2'
import { MongoIdDto, MongoIdsDto } from '@libs/types/common.dto'
import { PaginationMeta } from '@libs/types/common.type'
import { User } from '../../../generated/prisma/browser'

@Injectable()
export class AppService {
    constructor(private prisma: PrismaService) {}

    async createVoter(dto: CreateVoterDto) {
        const hashPassword = await hash(dto.password)

        try {
            return await this.prisma.user.create({
                data: {
                    email: dto.email,
                    password: hashPassword,
                    name: dto.name
                }
            })
        } catch (e) {
            handlePrismaError(e)
        }
    }

    async getUserByEmail(dto: GetUserByEmailDto) {
        return await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
    }

    async getUserById(dto: MongoIdDto) {
        return await this.prisma.user.findUnique({
            where: {
                id: dto.id
            },
            omit: {
                password: true
            }
        })
    }

    async disableUserById(dto: MongoIdDto) {
        try {
            return await this.prisma.user.update({
                where: {
                    id: dto.id
                },
                data: {
                    isActive: false
                }
            })
        } catch (e) {
            handlePrismaError(e)
        }
    }

    async enableUserById(dto: MongoIdDto) {
        try {
            return await this.prisma.user.update({
                where: {
                    id: dto.id
                },
                data: {
                    isActive: true
                }
            })
        } catch (e) {
            handlePrismaError(e)
        }
    }

    async deleteUserById(dto: MongoIdDto) {
        try {
            await this.prisma.user.delete({
                where: {
                    id: dto.id
                }
            })
        } catch (e) {
            handlePrismaError(e)
        }
    }

    async updateUserById(dto: MongoIdDto & UpdateUserByIdDto) {
        try {
            return await this.prisma.user.update({
                where: {
                    id: dto.id
                },
                data: {
                    email: dto.email,
                    name: dto.name
                },
                omit: {
                    password: true
                }
            })
        } catch (e) {
            handlePrismaError(e)
        }
    }

    async filterUsers(dto: FilterUsersDto): Promise<
        {
            data: Omit<User, 'password'>[]
        } & PaginationMeta
    > {
        const { email, name, isActive, page = 0, pageSize = 10 } = dto ?? {}

        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
                where: removeUndefinedObj({
                    email: email ? { contains: email, mode: 'insensitive' } : undefined,
                    name: name ? { contains: name, mode: 'insensitive' } : undefined,
                    isActive: isActive
                }),
                omit: {
                    password: true
                },
                skip: page * pageSize,
                take: pageSize
            }),
            this.prisma.user.count()
        ])

        return {
            data,
            totalPages: Math.ceil(total / pageSize),
            currentPage: page,
            pageSize: pageSize,
            total
        }
    }

    async deleteBulkUsersByIds(dto: MongoIdsDto) {
        const data = await this.prisma.user.deleteMany({
            where: {
                id: {
                    in: dto.ids
                }
            }
        })
        return data
    }

    async createBulkVoters(dto: CreateBulkVotersDto) {
        const emails = dto.data.map((item) => item.email)
        const existingUsers = await this.prisma.user.findMany({
            where: {
                email: {
                    in: emails
                }
            },
            select: {
                email: true
            }
        })
        const existingEmails = new Set(existingUsers.map((user) => user.email))

        // Duyệt qua dto.data một lần, vừa lọc vừa hash password
        const newDtos: { email: string; name: string; password: string }[] = []
        for (const item of dto.data) {
            if (!existingEmails.has(item.email)) {
                const hashedPassword = await hash(item.password)
                newDtos.push({
                    email: item.email,
                    name: item.name,
                    password: hashedPassword
                })
            }
        }

        if (newDtos.length === 0) {
            return { count: 0 }
        }

        const data = await this.prisma.user.createMany({
            data: newDtos
        })

        return data
    }
}
