import type { EcPointCons } from './params'
import { validate } from 'uuid'

const HEX_REGEX = /^[0-9a-fA-F]+$/

export function isValidUUID(str: string): boolean {
    return typeof str === 'string' && validate(str)
}

export function isValidHex(str: string): boolean {
    return typeof str === 'string' && str.length > 0 && HEX_REGEX.test(str)
}

/**
 * Kiểm tra hex là scalar hợp lệ trong [1, n-1].
 *   - Phải là hex string không rỗng
 *   - Sau khi parse: > 0 và < n
 */
export function isValidScalarHex(hexStr: string, n: bigint): boolean {
    if (!isValidHex(hexStr)) return false
    try {
        const v = BigInt('0x' + hexStr)
        return v > 0n && v < n
    } catch {
        return false
    }
}

/**
 * Kiểm tra hex là điểm hợp lệ trên curve.
 * BẮT BUỘC gọi cho mọi điểm nhận từ network — chống invalid-curve attack.
 */
export function isValidPointHex(hexStr: string, Point: EcPointCons): boolean {
    if (!isValidHex(hexStr)) return false
    try {
        const p = Point.fromHex(hexStr)
        p.assertValidity()
        return !p.equals(Point.ZERO)
    } catch {
        return false
    }
}

/**
 * Chống DoS bằng input khổng lồ.
 */
export function isReasonableHexLength(hexStr: string, maxBytes: number): boolean {
    return typeof hexStr === 'string' && hexStr.length <= maxBytes * 2
}
