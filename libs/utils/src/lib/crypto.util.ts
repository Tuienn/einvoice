import { randomBytes, createCipheriv, createDecipheriv } from 'crypto'

const algorithm = 'aes-256-gcm'
const ivLength = 12
const authTagLength = 16

export function encrypt(plainText: string, key: Buffer): string {
    const iv = randomBytes(ivLength)
    const cipher = createCipheriv(algorithm, key, iv)

    let encrypted = cipher.update(plainText, 'utf8')
    encrypted = Buffer.concat([encrypted, cipher.final()])
    const authTag = cipher.getAuthTag()

    // Ghép: IV + AuthTag + Ciphertext → mã hóa Base64 để dễ lưu/truyền
    return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

export function decrypt(encryptedText: string, key: Buffer): string {
    try {
        const combined = Buffer.from(encryptedText, 'base64')

        const iv = combined.subarray(0, ivLength)
        const authTag = combined.subarray(ivLength, ivLength + authTagLength)
        const encrypted = combined.subarray(ivLength + authTagLength)

        const decipher = createDecipheriv(algorithm, key, iv)
        decipher.setAuthTag(authTag) // Bắt buộc xác thực integrity

        let decrypted = decipher.update(encrypted)
        decrypted = Buffer.concat([decrypted, decipher.final()])

        return decrypted.toString('utf8')
    } catch {
        throw new Error('Decryption failed: Invalid ciphertext or authentication tag')
    }
}
