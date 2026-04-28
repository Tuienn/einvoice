import { BN, modPow, randomInZqStar } from './utils.js'

export interface KeyPair {
    privateKey: BN
    publicKey: BN
}

/**
 * Sinh cặp khóa cho 1 signing node.
 * d_i ∈ Z_q* (khóa riêng), ρ_i = g^{d_i} mod p (khóa công khai)
 *
 * @param {BN} p
 * @param {BN} q
 * @param {BN} g
 * @returns {{ privateKey: BN, publicKey: BN }}
 */
export function generateKeyPair(p: BN, q: BN, g: BN): KeyPair {
    const privateKey = randomInZqStar(q)
    const publicKey = modPow(g, privateKey, p)
    return { privateKey, publicKey }
}

/**
 * Tính khóa công khai tập thể: ρ = ∏ ρ_i mod p
 *
 * @param {BN[]} publicKeys - mảng các ρ_i
 * @param {BN} p
 * @returns {BN}
 */
export function computeCollectivePublicKey(publicKeys: BN[], p: BN): BN {
    let rho = new BN(1)
    for (const pk of publicKeys) {
        rho = rho.mul(pk).umod(p)
    }
    return rho
}
