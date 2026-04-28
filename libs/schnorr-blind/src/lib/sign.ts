import { BN, mod } from './utils.js'

/**
 * Pha Ký (Signing) — thực hiện bởi mỗi Signing Node.
 *
 * Input:
 *   - k_i: BN — nonce riêng của node
 *   - d_i: BN — khóa riêng của node
 *   - r: BN — giá trị đã làm mù từ Client
 *   - q: BN — bậc của nhóm con
 *
 * Output:
 *   - s_i: BN — chữ ký partial
 *
 * Công thức: s_i = (k_i - d_i · r) mod q
 */
export function signPartial(ki: BN, di: BN, r: BN, q: BN): BN {
    const diR = di.mul(r).umod(q)
    const si = mod(ki.sub(diR), q)
    return si
}

/**
 * Tổng hợp chữ ký partial — thực hiện bởi Coordinator.
 *
 * s = Σ s_i mod q
 *
 * @param {BN[]} partialSigs - mảng các s_i
 * @param {BN} q
 * @returns {BN}
 */
export function aggregateSignatures(partialSigs: BN[], q: BN): BN {
    let s = new BN(0)
    for (const si of partialSigs) {
        s = s.add(si).umod(q)
    }
    return s
}
