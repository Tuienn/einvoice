import { SessionIdDto, SignPartialDto } from '@libs/types/signing-node/app.dto'
import { Injectable } from '@nestjs/common'
import { CryptoService } from '../infrastructure/crypto/crypto.service'
import { CONFIGURATION } from '../configuration'

@Injectable()
export class AppService {
    constructor(private readonly cryptoService: CryptoService) {}

    async createCommitment(dto: SessionIdDto) {
        const result = await this.cryptoService.createCommitment(dto.sessionId)
        return {
            nodeId: CONFIGURATION.SIGNING_NODE_CONFIG.NODE_ID,
            cI: result.cI,
            rhoI: result.rhoI
        }
    }

    async signPartial(dto: SignPartialDto) {
        const result = await this.cryptoService.signPartial(dto.sessionId, dto.rHex)
        return {
            nodeId: CONFIGURATION.SIGNING_NODE_CONFIG.NODE_ID,
            sI: result.sI
        }
    }

    async getNodeInfo() {
        return {
            nodeId: CONFIGURATION.SIGNING_NODE_CONFIG.NODE_ID,
            publicKey: this.cryptoService.getPublicKey()
        }
    }
}
