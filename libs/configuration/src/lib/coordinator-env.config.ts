import { IsNumber, IsString } from 'class-validator'

export class CoordinatorEnvConfiguration {
    @IsString()
    TCP_HOST: string

    @IsNumber()
    TCP_PORT: number

    @IsString()
    IDENTITY_TCP_NAME: string

    @IsString()
    IDENTITY_TCP_HOST: string

    @IsNumber()
    IDENTITY_TCP_PORT: number

    constructor() {
        this.TCP_HOST = process.env['TCP_HOST'] || 'localhost'
        this.TCP_PORT = Number(process.env['TCP_PORT']) || 3303

        this.IDENTITY_TCP_NAME = process.env['IDENTITY_TCP_NAME'] || 'IDENTITY'
        this.IDENTITY_TCP_HOST = process.env['IDENTITY_TCP_HOST'] || 'localhost'
        this.IDENTITY_TCP_PORT = Number(process.env['IDENTITY_TCP_PORT']) || 3302
    }
}
