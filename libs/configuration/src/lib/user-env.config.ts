import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class UserEnvConfiguration {
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
    USER_TCP_HOST: string

    @IsNumber()
    USER_TCP_PORT: number

    @IsString()
    @IsNotEmpty()
    DEFAULT_ADMIN_EMAIL: string

    @IsString()
    @IsNotEmpty()
    DEFAULT_ADMIN_PASSWORD: string

    @IsNumber()
    REDIS_CACHE_TTL: number

    @IsString()
    @IsNotEmpty()
    REDIS_HOST: string

    @IsNumber()
    REDIS_PORT: number

    @IsString()
    @IsNotEmpty()
    REDIS_PASSWORD: string

    constructor() {
        this.HTTP_PORT = Number(process.env['HTTP_PORT']) || 3000
        this.HTTP_GLOBAL_PREFIX = process.env['HTTP_GLOBAL_PREFIX'] || 'api/v1'
        this.TCP_HOST = process.env['TCP_HOST'] || 'localhost'
        this.TCP_PORT = Number(process.env['TCP_PORT']) || 3001
        this.USER_TCP_HOST = process.env['USER_TCP_HOST'] || 'localhost'
        this.USER_TCP_PORT = Number(process.env['USER_TCP_PORT']) || 3002
        this.DEFAULT_ADMIN_EMAIL = process.env['DEFAULT_ADMIN_EMAIL'] || 'admin@example.com'
        this.DEFAULT_ADMIN_PASSWORD = process.env['DEFAULT_ADMIN_PASSWORD'] || '12345678'
        this.REDIS_CACHE_TTL = Number(process.env['REDIS_CACHE_TTL']) || 60000
        this.REDIS_HOST = process.env['REDIS_HOST'] || 'localhost'
        this.REDIS_PORT = Number(process.env['REDIS_PORT']) || 6379
        this.REDIS_PASSWORD = process.env['REDIS_PASSWORD'] || 'secret'
    }
}
