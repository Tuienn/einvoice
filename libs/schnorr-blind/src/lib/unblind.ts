import { BN, mod } from './utils.js'

export interface SchnorrSignature {
    h: BN
    sPrime: BN
}

/**
 * Pha Giải mù (Unblinding) — thực hiện bởi Client.
 *
 * Input:
 *   - s: BN — chữ ký tổng hợp từ Coordinator
 *   - alpha: BN — bí mật giải mù
 *   - h: BN — hash value từ pha làm mù
 *   - q: BN — bậc của nhóm con
 *
 * Output:
 *   - Chữ ký cuối cùng (h, s')
 *
 * Công thức: s' = (s + α) mod q
 */
export function unblind(s: BN, alpha: BN, h: BN, q: BN): SchnorrSignature {
    const sPrime = mod(s.add(alpha), q)
    return { h, sPrime }
}
