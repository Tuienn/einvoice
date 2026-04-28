import { createHash, randomBytes } from 'node:crypto'
import BN from 'bn.js'

/**
 * Modular exponentiation: (base^exp) mod mod
 * Sử dụng Montgomery reduction của bn.js cho hiệu năng.
 * @param {BN} base
 * @param {BN} exp
 * @param {BN} mod
 * @returns {BN}
 */
export function modPow(base: BN, exp: BN, modulus: BN): BN {
    const red = BN.red(modulus)
    const baseMod = base.umod(modulus).toRed(red)
    if (exp.isNeg()) {
        throw new Error('modPow: negative exponent is not supported')
    }
    return baseMod.redPow(exp).fromRed()
}

/**
 * Modulo đảm bảo kết quả dương: ((a % n) + n) % n
 * @param {BN} a
 * @param {BN} n
 * @returns {BN}
 */
export function mod(a: BN, n: BN): BN {
    return a.umod(n)
}

/**
 * Hash SHA-256 chuỗi các buffer, trả về BN mod q.
 * Input: mảng các Buffer sẽ được nối (concatenate) trước khi hash.
 * @param {Buffer[]} buffers
 * @param {BN} q
 * @returns {BN}
 */
export function hashToBN(buffers: Buffer[], q: BN): BN {
    const hash = createHash('sha256')
    for (const buf of buffers) {
        hash.update(buf)
    }
    const digest = hash.digest()
    const num = new BN(digest)
    return num.umod(q)
}

/**
 * Chuyển BN thành Buffer big-endian, zero-padded đến byteLen bytes.
 * Dùng để đảm bảo encoding nhất quán khi hash.
 * @param {BN} bn
 * @param {number} byteLen
 * @returns {Buffer}
 */
export function bnToBuffer(bn: BN, byteLen: number): Buffer {
    const hex = bn.toString(16).padStart(byteLen * 2, '0')
    return Buffer.from(hex, 'hex')
}

/**
 * Sinh số ngẫu nhiên trong Z_q* (tức [1, q-1]) bằng CSPRNG.
 * Reject-sampling: lặp cho đến khi ra giá trị hợp lệ (khác 0 và < q).
 * @param {BN} q
 * @returns {BN}
 */
export function randomInZqStar(q: BN): BN {
    const byteLen = Math.ceil(q.bitLength() / 8) + 8
    while (true) {
        const buf = randomBytes(byteLen)
        const candidate = new BN(buf).umod(q)
        if (!candidate.isZero()) {
            return candidate
        }
    }
}

export { BN }
