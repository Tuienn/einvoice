import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator'

export class BffEnvConfiguration {
    @IsNumber()
    HTTP_PORT: number

    @IsString()
    @IsNotEmpty()
    HTTP_GLOBAL_PREFIX: string

    @IsString()
    TCP_HOST: string

    @IsNumber()
    TCP_PORT: number

    @IsString()
    IDENTITY_TCP_HOST: string

    @IsNumber()
    IDENTITY_TCP_PORT: number

    @IsString()
    CORS_ORIGINS: string

    @IsNumber()
    @Min(1000)
    THROTTLE_TTL: number

    @IsNumber()
    @Min(1)
    THROTTLE_LIMIT: number

    @IsString()
    JWT_ACCESS_SECRET: string

    constructor() {
        this.HTTP_PORT = Number(process.env['HTTP_PORT']) || 3000
        this.HTTP_GLOBAL_PREFIX = process.env['HTTP_GLOBAL_PREFIX'] || 'api/v1'
        this.TCP_HOST = process.env['TCP_HOST'] || 'localhost'
        this.TCP_PORT = Number(process.env['TCP_PORT']) || 3001
        this.IDENTITY_TCP_HOST = process.env['IDENTITY_TCP_HOST'] || 'localhost'
        this.IDENTITY_TCP_PORT = Number(process.env['IDENTITY_TCP_PORT']) || 3302
        this.CORS_ORIGINS = process.env['CORS_ORIGINS'] || 'http://localhost:5173,http://localhost:3000'
        this.THROTTLE_TTL = Number(process.env['THROTTLE_TTL']) || 60000
        this.THROTTLE_LIMIT = Number(process.env['THROTTLE_LIMIT']) || 100
        this.JWT_ACCESS_SECRET = process.env['JWT_ACCESS_SECRET'] || 'default_access_secret'
    }
}
