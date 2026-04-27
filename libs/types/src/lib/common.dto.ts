import { invalidDataField, missingDataField } from '@libs/constants/text.constant'
import { IsDefined, IsMongoId } from 'class-validator'

export class MongoIdDto {
    @IsDefined({ message: missingDataField('ID') })
    @IsMongoId({ message: invalidDataField('ID', 'MongoDB ObjectId') })
    id: string
}
