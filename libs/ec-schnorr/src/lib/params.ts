import { secp256k1 } from '@noble/curves/secp256k1.js'
import type { WeierstrassPoint, WeierstrassPointCons } from '@noble/curves/abstract/weierstrass.js'

export type EcPoint = WeierstrassPoint<bigint>
export type EcPointCons = WeierstrassPointCons<bigint>

export interface EcParams {
    curve: typeof secp256k1
    n: bigint
    G: EcPoint
    Point: EcPointCons
    POINT_BYTES: number
    SCALAR_BYTES: number
}

/**
 * Tham số EC-Schnorr trên secp256k1.
 *   n  : bậc nhóm (~256-bit prime)
 *   G  : generator point
 *   Point : class điểm (dùng để decode/validate)
 *   POINT_BYTES  = 33 (compressed)
 *   SCALAR_BYTES = 32
 *
 * Curve cố định ở mức library — client/server cùng gọi getParams() để có cùng tham số.
 */
export function getParams(): EcParams {
    return {
        curve: secp256k1,
        n: secp256k1.Point.CURVE().n,
        G: secp256k1.Point.BASE,
        Point: secp256k1.Point,
        POINT_BYTES: 33,
        SCALAR_BYTES: 32
    }
}
