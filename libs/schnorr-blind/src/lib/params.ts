import { BN, modPow } from './utils.js'

/**
 * Bộ tham số DSA 1024-bit / 160-bit từ RFC 2409 (OAKLEY Group 2) + subgroup.
 * Sử dụng cho PoC/Test. Production nên dùng 2048-bit.
 *
 * p: số nguyên tố 1024-bit
 * q: số nguyên tố 160-bit, q | (p-1)
 * g: phần tử sinh bậc q trong Z_p*
 */

// Chúng ta sẽ sinh g = h^((p-1)/q) mod p với h = 2
// Thay vì hardcode, tính runtime để đảm bảo tính nhất quán.

/**
 * Sinh bộ tham số PoC 1024-bit.
 * Vì việc sinh p, q an toàn rất chậm, ta dùng bộ tham số từ OpenSSL.
 * g được tính từ p, q để đảm bảo g^q ≡ 1 (mod p).
 */
export interface SchnorrParams {
    p: BN
    q: BN
    g: BN
}

export function generateTestParams(): SchnorrParams {
    // Dùng bộ tham số DSA 1024/160 từ FIPS 186-4 appendix
    const p = new BN(
        'fd7f53811d75122952df4a9c2eece4e7f611b7523cef4400c31e3f80b6512669' +
            '455d402251fb593d8d58fabfc5f5ba30f6cb9b556cd7813b801d346ff26660b7' +
            '6b9950a5a49f9fe8047b1022c24fbba9d7feb7c61bf83b57e7c6a8a6150f04fb' +
            '83f6d3c51ec3023554135a169132f675f3ae2b61d72aeff22203199dd14801c7',
        16
    )

    const q = new BN('9760508f15230bccb292b982a2eb840bf0581cf5', 16)

    // g = h^((p-1)/q) mod p, với h=2
    const pMinus1DivQ = p.sub(new BN(1)).div(q)
    const g = modPow(new BN(2), pMinus1DivQ, p)

    // Validation
    if (!modPow(g, q, p).eq(new BN(1))) {
        throw new Error('params: g^q mod p != 1 — invalid parameter')
    }
    if (g.eq(new BN(1))) {
        throw new Error('params: g = 1 — invalid generator')
    }
    if (!p.sub(new BN(1)).umod(q).isZero()) {
        throw new Error('params: q does not divide (p-1)')
    }

    return { p, q, g }
}

/**
 * Bộ tham số nhỏ để unit test nhanh (KHÔNG an toàn mật mã).
 * p = 23, q = 11, g = 4 (4^11 mod 23 = 1)
 */
export function getSmallTestParams(): SchnorrParams {
    const p = new BN(23)
    const q = new BN(11)
    const g = new BN(4)

    if (!modPow(g, q, p).eq(new BN(1))) {
        throw new Error('small params: g^q mod p != 1')
    }

    return { p, q, g }
}

/**
 * Byte length cho padding khi encode BN thành buffer.
 */
export function getByteLength(p: BN): number {
    return Math.ceil(p.bitLength() / 8)
}
