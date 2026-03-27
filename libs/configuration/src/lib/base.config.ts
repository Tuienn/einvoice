export default class BaseConfiguration {
    NODE_ENV: string
    IS_DEV: boolean
    PORT: number
    GLOBAL_PREFIX: string

    constructor() {
        this.NODE_ENV = process.env['NODE_ENV'] || 'development'
        this.IS_DEV = this.NODE_ENV === 'development'
        this.PORT = Number(process.env['PORT']) || 3000
        this.GLOBAL_PREFIX = process.env['GLOBAL_PREFIX'] || 'api/v1'
    }
}
