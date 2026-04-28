import { BN, modPow, randomInZqStar } from './utils.js'

export interface Commitment {
    nonce: BN
    commitment: BN
}

/**
 * Sinh commitment cho 1 signing node.
 * k_i ∈ Z_q* (nonce), c_i = g^{k_i} mod p (commitment)
 *
 * QUAN TRỌNG: k_i chỉ được dùng MỘT LẦN. Tái sử dụng sẽ lộ khóa riêng.
 *
 * @param {BN} p
 * @param {BN} q
 * @param {BN} g
 * @returns {{ nonce: BN, commitment: BN }}
 */
export function generateCommitment(p: BN, q: BN, g: BN): Commitment {
    const nonce = randomInZqStar(q)
    const commitment = modPow(g, nonce, p)
    return { nonce, commitment }
}

/**
 * Tính commitment tập thể: c = ∏ c_i mod p
 *
 * @param {BN[]} commitments - mảng các c_i
 * @param {BN} p
 * @returns {BN}
 */
export function computeCollectiveCommitment(commitments: BN[], p: BN): BN {
    let c = new BN(1)
    for (const ci of commitments) {
        c = c.mul(ci).umod(p)
    }
    return c
}
