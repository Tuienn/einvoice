import { BN } from './utils'
import { validate } from 'uuid'

const HEX_REGEX = /^[0-9a-fA-F]+$/

/**
 * Validate UUID v4 format.
 */
export function isValidUUID(str: unknown): str is string {
    return validate(str)
}

/**
 * Validate hex string (non-empty, only hex chars).
 */
export function isValidHex(str: unknown): str is string {
    return typeof str === 'string' && str.length > 0 && HEX_REGEX.test(str)
}

/**
 * Validate hex string và kiểm tra giá trị BN nằm trong range [1, upperBound-1].
 * Dùng để validate r, s_i trước khi tính toán.
 */
export function isValidBNHex(hexStr: unknown, upperBound: BN): boolean {
    if (!isValidHex(hexStr)) return false
    try {
        const val = new BN(hexStr, 16)
        return !val.isZero() && val.lt(upperBound)
    } catch {
        return false
    }
}

/**
 * Kiểm tra hex string không vượt quá maxBytes byte (chống DoS bằng input khổng lồ).
 */
export function isReasonableHexLength(hexStr: unknown, maxBytes: number): boolean {
    return typeof hexStr === 'string' && hexStr.length <= maxBytes * 2
}
