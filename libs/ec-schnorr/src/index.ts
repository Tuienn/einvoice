export { getParams } from './lib/params'
export {
    modN,
    randomScalar,
    scalarMultBase,
    scalarMult,
    pointAdd,
    pointToHex,
    hexToPoint,
    scalarToHex,
    hexToScalar,
    scalarToBuffer,
    pointToBuffer,
    hashToScalar,
    bytesToBigInt,
    bigIntToBytes,
    bytesToHex,
    sha256,
    SCALAR_BYTES,
    POINT_BYTES
} from './lib/utils'
export { generateKeyPair, computeCollectivePublicKey } from './lib/keygen'
export { generateCommitment, computeCollectiveCommitment } from './lib/commitment'
export { blind } from './lib/blind'
export { signPartial, aggregateSignatures } from './lib/sign'
export { unblind } from './lib/unblind'
export { verify } from './lib/verify'
export { isValidUUID, isValidHex, isValidScalarHex, isValidPointHex, isReasonableHexLength } from './lib/validation'

export type { EcParams, EcPoint, EcPointCons } from './lib/params'
export type { KeyPair } from './lib/keygen'
export type { Commitment } from './lib/commitment'
export type { BlindResult } from './lib/blind'
export type { UnblindResult } from './lib/unblind'
