import { sha256 } from '@noble/hashes/sha2.js'
import { randomBytes, bytesToHex } from '@noble/hashes/utils.js'
import type { EcParams, EcPoint } from './params'

export const SCALAR_BYTES = 32
export const POINT_BYTES = 33

export function modN(a: bigint, n: bigint): bigint {
    const r = a % n
    return r < 0n ? r + n : r
}

export function bytesToBigInt(bytes: Uint8Array): bigint {
    let n = 0n
    for (const b of bytes) n = (n << 8n) | BigInt(b)
    return n
}

export function bigIntToBytes(value: bigint, byteLen: number): Uint8Array {
    if (value < 0n) throw new Error('bigIntToBytes: giá trị âm không hợp lệ')
    const out = new Uint8Array(byteLen)
    let v = value
    for (let i = byteLen - 1; i >= 0; i--) {
        out[i] = Number(v & 0xffn)
        v >>= 8n
    }
    if (v !== 0n) throw new Error('bigIntToBytes: giá trị vượt quá byteLen')
    return out
}

export function randomScalar(n: bigint): bigint {
    while (true) {
        const buf = randomBytes(SCALAR_BYTES + 8)
        const candidate = modN(bytesToBigInt(buf), n)
        if (candidate !== 0n) return candidate
    }
}

export function scalarMultBase(scalar: bigint, params: EcParams): EcPoint {
    return params.G.multiply(scalar)
}

export function scalarMult(point: EcPoint, scalar: bigint): EcPoint {
    return point.multiply(scalar)
}

export function pointAdd(P: EcPoint, Q: EcPoint): EcPoint {
    return P.add(Q)
}

export function pointToHex(point: EcPoint): string {
    return bytesToHex(point.toBytes(true))
}

export function hexToPoint(hex: string, params: EcParams): EcPoint {
    const p = params.Point.fromHex(hex)
    p.assertValidity()
    if (p.equals(params.Point.ZERO)) {
        throw new Error('hexToPoint: điểm là identity (vô hạn)')
    }
    return p
}

export function scalarToHex(scalar: bigint): string {
    return bytesToHex(bigIntToBytes(scalar, SCALAR_BYTES))
}

export function hexToScalar(hex: string): bigint {
    const clean = hex.startsWith('0x') ? hex.slice(2) : hex
    return BigInt('0x' + clean)
}

export function scalarToBuffer(scalar: bigint, byteLen: number = SCALAR_BYTES): Uint8Array {
    return bigIntToBytes(scalar, byteLen)
}

export function pointToBuffer(point: EcPoint): Uint8Array {
    return point.toBytes(true)
}

/**
 * Hash chuỗi các buffer/Uint8Array về scalar trong [0, n-1].
 */
export function hashToScalar(buffers: (Uint8Array | ArrayBuffer)[], n: bigint): bigint {
    const h = sha256.create()
    for (const buf of buffers) {
        h.update(buf instanceof Uint8Array ? buf : new Uint8Array(buf))
    }
    return modN(bytesToBigInt(h.digest()), n)
}

export { bytesToHex, sha256 }
