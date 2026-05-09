import { GetVoterInElectionDto } from './election.dto'
import { SignPartialDto } from '../signing-node/app.dto'
import { IsDefined, IsHexadecimal, IsUUID } from 'class-validator'
import { invalidDataField, missingDataField } from '@libs/constants/text.constant'

export class StartSessionDto extends GetVoterInElectionDto {}

export class SignBlindedVoteDto extends SignPartialDto {}

export class SubmitBlindedVoteHashDto extends GetVoterInElectionDto {
    @IsDefined({ message: missingDataField('sessionId') })
    @IsUUID(4, { message: invalidDataField('sessionId', 'uuid') })
    sessionId: string

    @IsDefined({ message: missingDataField('blindedVoteHash') })
    @IsHexadecimal({ message: invalidDataField('blindedVoteHash', 'hexadecimal') })
    blindedVoteHash: string

    @IsDefined({ message: missingDataField('signatureHex') })
    @IsHexadecimal({ message: invalidDataField('signatureHex', 'hexadecimal') })
    signatureHex: string
}
