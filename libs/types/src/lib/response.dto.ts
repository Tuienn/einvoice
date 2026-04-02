import { HTTP_MESSAGE_TITLES } from '@libs/constants/http.constant'
import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'

export class ResponseDto<T> {
    @ApiProperty({ type: 'string', example: HTTP_MESSAGE_TITLES.OK })
    title = HTTP_MESSAGE_TITLES.OK

    @ApiProperty({ type: 'string', example: 'OK' })
    message?: string

    @ApiProperty()
    data?: T

    @ApiProperty({ type: 'number', example: HttpStatus.OK })
    statusCode = HttpStatus.OK

    constructor(data: Partial<ResponseDto<T>>) {
        Object.assign(this, data)
        this.message = this.message || this.title
    }
}
