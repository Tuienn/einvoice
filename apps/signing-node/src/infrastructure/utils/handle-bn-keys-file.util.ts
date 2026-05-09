import * as fs from 'fs'
import { BN } from '@libs/schnorr-blind'
import * as path from 'path'

type SaveKeysInput = {
    fileName: string
    data: Record<string, BN>
}

export function saveKeysToJsonFile({ fileName, data }: SaveKeysInput) {
    const keyDir = path.join(process.cwd(), 'keys')

    // tạo folder nếu chưa tồn tại
    if (!fs.existsSync(keyDir)) {
        fs.mkdirSync(keyDir, { recursive: true })
    }

    // convert BN -> hex string
    const jsonData = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value.toString(16)]))

    const filePath = path.join(keyDir, `${fileName}.json`)

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 4), {
        encoding: 'utf8',
        mode: 0o600
    })

    return filePath
}

export function loadKeysFromJsonFile(filePath: string): Record<string, BN> | null {
    if (!fs.existsSync(filePath)) {
        return null
    }

    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })
    const jsonData = JSON.parse(fileContent)

    // convert hex string -> BN
    const data = Object.fromEntries(Object.entries(jsonData).map(([key, value]) => [key, new BN(String(value), 16)]))

    return data
}
