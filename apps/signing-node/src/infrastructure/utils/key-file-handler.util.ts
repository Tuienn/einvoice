import * as fs from 'fs'
import * as path from 'path'

type SaveKeysInput = {
    fileName: string
    data: Record<string, string>
}

export function saveKeysToJsonFile({ fileName, data }: SaveKeysInput) {
    const keyDir = path.join(process.cwd(), 'keys')

    // tạo folder nếu chưa tồn tại
    if (!fs.existsSync(keyDir)) {
        fs.mkdirSync(keyDir, { recursive: true })
    }

    const filePath = path.join(keyDir, `${fileName}.json`)

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4), {
        encoding: 'utf8',
        mode: 0o600
    })

    return filePath
}

export function loadKeysFromJsonFile(filePath: string): Record<string, string> | null {
    if (!fs.existsSync(filePath)) {
        return null
    }

    const fileContent = fs.readFileSync(filePath, {
        encoding: 'utf8'
    })

    return JSON.parse(fileContent) as Record<string, string>
}
