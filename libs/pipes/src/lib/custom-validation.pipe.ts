import { BadRequestException, Injectable, ValidationPipe } from '@nestjs/common'
import { ValidationError } from 'class-validator'

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
    constructor() {
        super({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            stopAtFirstError: true,
            forbidUnknownValues: true,
            exceptionFactory: (errors: ValidationError[] = []) => {
                const message = errors
                    .map((e) => {
                        const constraints = e.constraints ? Object.values(e.constraints).join(', ') : ''
                        return constraints
                        // return `${e.property} - ${constraints}`
                    })
                    .join('; ')

                return new BadRequestException(message)
            }
        })
    }
}
