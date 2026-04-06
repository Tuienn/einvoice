import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { CONFIGURATION } from '../configuration'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class AppService {
    constructor(@Inject(`TCP_${CONFIGURATION.SERVICE_NAME}`) private readonly userClient: ClientProxy) {}

    async getData(): Promise<{ message: string }> {
        return { message: `Hello API` }
    }

    async testTcp() {
        return firstValueFrom(this.userClient.send('get_user_info', { userId: 'usr-001' }))
    }
}
