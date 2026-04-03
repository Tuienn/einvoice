import { ResponseDto } from '@libs/types/response.dto'
import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common'
import { catchError, Observable } from 'rxjs'
import { HTTP_MESSAGE_TITLES } from '@libs/constants/http.constant'

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        if (context.getType() !== 'http') {
            return next.handle()
        }

        return next.handle().pipe(
            catchError((error) => {
                const message = error.message || HTTP_MESSAGE_TITLES.INTERNAL_SERVER_ERROR
                const statusCode = error.statusCode || error.code || HttpStatus.INTERNAL_SERVER_ERROR

                throw new HttpException(
                    new ResponseDto({
                        title: HTTP_MESSAGE_TITLES.INTERNAL_SERVER_ERROR,
                        message,
                        statusCode,
                        data: null
                    }),
                    statusCode
                )
            })
        )
    }
}
