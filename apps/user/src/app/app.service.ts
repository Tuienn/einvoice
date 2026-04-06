import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
    async getData(): Promise<{ message: string }> {
        return { message: `Hello API` }
    }

    getUserInfo(userId: string) {
        return {
            id: userId,
            name: 'Nguyễn Văn A',
            email: 'nguyenvana@example.com',
            role: 'admin'
        }
    }
}
