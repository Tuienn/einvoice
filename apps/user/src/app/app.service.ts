import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { CONFIGURATION } from '../configuration'

@Injectable()
export class AppService {
    constructor(@Inject(`TCP_${CONFIGURATION.SERVICE_NAME}`) private readonly userClient: ClientProxy) {}

    async helloWorld() {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return {
            name: 'Nguyen Van A',
            email: 'a@example.com'
        }
    }
}
