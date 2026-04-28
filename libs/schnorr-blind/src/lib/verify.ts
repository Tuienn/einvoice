import { BN, bnToBuffer, hashToBN, modPow } from './utils.js'
import { getByteLength } from './params.js'

/**
 * Pha Xác thực (Verify) — thực hiện bởi Verifier.
 *
 * Input:
 *   - message: Buffer — thông điệp gốc
 *   - h: BN — phần đầu của chữ ký
 *   - sPrime: BN — phần hai của chữ ký
 *   - p, q, g: BN — tham số hệ thống
 *   - rho: BN — khóa công khai tập thể
 *
 * Output:
 *   - boolean — true nếu chữ ký hợp lệ
 *
 * Công thức:
 *   1. c_check = g^{s'} · ρ^h mod p
 *   2. h_check = Hash(M ‖ c_check) mod q
 *   3. Hợp lệ nếu h == h_check
 */
export function verify(message: Buffer, h: BN, sPrime: BN, p: BN, q: BN, g: BN, rho: BN): boolean {
    // c_check = g^s' * rho^h mod p
    const gSPrime = modPow(g, sPrime, p)
    const rhoH = modPow(rho, h, p)
    const cCheck = gSPrime.mul(rhoH).umod(p)

    // h_check = Hash(M || c_check) mod q
    const byteLen = getByteLength(p)
    const cCheckBuffer = bnToBuffer(cCheck, byteLen)
    const hCheck = hashToBN([message, cCheckBuffer], q)

    return h.eq(hCheck)
}
