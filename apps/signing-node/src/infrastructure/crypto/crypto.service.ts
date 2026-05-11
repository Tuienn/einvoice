import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { CONFIGURATION } from '../../configuration'
import {
    getParams,
    type EcPoint,
    pointToHex,
    generateCommitment,
    EcParams,
    signPartial,
    hexToScalar,
    scalarToHex
} from '@libs/ec-schnorr'

@Injectable()
export class CryptoService {
    private readonly params: EcParams

    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
        const ecParams = getParams()

        this.params = ecParams
    }

    async deleteSessionNonce(sessionId: string) {
        await this.cacheManager.del(`session:nonce:${CONFIGURATION.SERVICE_NAME}:${sessionId}`)
    }

    private async setSessionNonce(sessionId: string, nonce: bigint) {
        //NOTE - 1 thời điểm chỉ có 1 commitment với 1 session nonce chống Nonce reuse (tấn công phục hồi private key)
        const existNonce = await this.cacheManager.get<string>(
            `session:nonce:${CONFIGURATION.SERVICE_NAME}:${sessionId}`
        )

        if (existNonce) {
            throw new ConflictException('Session:nonce already exists')
        }

        await this.cacheManager.set(
            `session:nonce:${CONFIGURATION.SERVICE_NAME}:${sessionId}`,
            scalarToHex(nonce),
            CONFIGURATION.SIGNING_NODE_CONFIG.REDIS_CACHE_TTL
        )
    }

    private async getSessionNonce(sessionId: string): Promise<bigint> {
        const nonce = await this.cacheManager.get<string>(`session:nonce:${CONFIGURATION.SERVICE_NAME}:${sessionId}`)

        if (!nonce) {
            throw new NotFoundException('Session:nonce not found or expired')
        }

        //NOTE - xóa nonce sau khi lấy để chống Nonce reuse (tấn công phục hồi private key)
        await this.deleteSessionNonce(sessionId)
        return hexToScalar(nonce)
    }

    async createCommitment(sessionId: string, publicKey: EcPoint): Promise<{ cI: string; rhoI: string }> {
        const { nonce, commitment } = generateCommitment(this.params)
        await this.setSessionNonce(sessionId, nonce)

        return {
            cI: pointToHex(commitment),
            rhoI: pointToHex(publicKey)
        }
    }

    async signPartial(sessionId: string, rHex: string, privateKey: bigint): Promise<{ sI: string }> {
        const nonce = await this.getSessionNonce(sessionId)
        const r = hexToScalar(rHex)
        const sI = signPartial(nonce, privateKey, r, this.params)

        return {
            sI: scalarToHex(sI)
        }
    }
}
