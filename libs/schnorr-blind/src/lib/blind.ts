import { BN, bnToBuffer, hashToBN, mod, modPow, randomInZqStar } from './utils.js'
import { getByteLength } from './params.js'

export interface BlindResult {
    r: BN
    alpha: BN
    beta: BN
    h: BN
    cPrime: BN
}

/**
 * Pha Làm mù (Blinding) — thực hiện bởi Client.
 *
 * Input:
 *   - message: Buffer — thông điệp gốc
 *   - c: BN — commitment tập thể (∏ c_i mod p)
 *   - p, q, g: BN — tham số hệ thống
 *   - rho: BN — khóa công khai tập thể
 *
 * Output:
 *   - r: BN — giá trị đã làm mù, gửi cho Nodes ký
 *   - alpha: BN — bí mật giải mù (giữ lại)
 *   - beta: BN — bí mật giải mù (giữ lại)
 *   - h: BN — hash value (giữ lại cho chữ ký cuối cùng)
 *
 * Công thức:
 *   1. Chọn α, β ∈ Z_q* ngẫu nhiên
 *   2. c' = c · g^α · ρ^β mod p
 *   3. h = Hash(M ‖ c') mod q
 *   4. r = (h - β) mod q
 */
export function blind(message: Buffer, c: BN, p: BN, q: BN, g: BN, rho: BN): BlindResult {
    const alpha = randomInZqStar(q)
    const beta = randomInZqStar(q)

    // c' = c * g^alpha * rho^beta mod p
    const gAlpha = modPow(g, alpha, p)
    const rhoBeta = modPow(rho, beta, p)
    const cPrime = c.mul(gAlpha).umod(p).mul(rhoBeta).umod(p)

    // h = Hash(M || c') mod q
    const byteLen = getByteLength(p)
    const cPrimeBuffer = bnToBuffer(cPrime, byteLen)
    const h = hashToBN([message, cPrimeBuffer], q)

    // r = (h - beta) mod q
    const r = mod(h.sub(beta), q)

    return { r, alpha, beta, h, cPrime }
}
