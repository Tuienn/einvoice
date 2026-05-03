import { invalidDataField, invalidDataFieldInArray } from '@libs/constants/text.constant'
import { applyDecorators } from '@nestjs/common'
import { IsArray, IsMongoId } from 'class-validator'

export const IsMongoIdArray = (fieldName: string) => {
    return applyDecorators(
        IsArray({ message: invalidDataField(fieldName, 'array') }),
        IsMongoId({ each: true, message: invalidDataFieldInArray(fieldName, 'MongoId') })
    )
}
