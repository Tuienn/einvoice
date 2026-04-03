import { BadGatewayException, Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
    getData(): { message: string } {
        throw new BadGatewayException('Test exception handling in AppService')

        return { message: `Hello API` }
    }
}
