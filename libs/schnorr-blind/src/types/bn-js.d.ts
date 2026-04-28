declare module 'bn.js' {
    export default class BN {
        constructor(number: number | string | Buffer | Uint8Array | BN, base?: number | 'hex')

        static red(num: BN): unknown

        add(num: BN): BN
        bitLength(): number
        div(num: BN): BN
        eq(num: BN): boolean
        fromRed(): BN
        isNeg(): boolean
        isZero(): boolean
        lt(num: BN): boolean
        mul(num: BN): BN
        redPow(num: BN): BN
        sub(num: BN): BN
        toRed(reductionContext: unknown): BN
        toString(base?: number | 'hex'): string
        umod(num: BN): BN
    }
}
