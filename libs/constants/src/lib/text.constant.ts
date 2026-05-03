export const AUTH_TEXT = {
    INVALID_ACCESS_TOKEN: 'Invalid or expired access token',
    ACCESS_TOKEN_REQUIRED: 'Access token is required',
    INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
    USER_NOT_FOUND: 'User not found',
    ACCOUNT_DISABLED: 'Account has been disabled',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_ID_REQUIRED: 'User ID is required in request headers'
}

export const missingDataField = (field: string) => `${field} is required`

export const invalidDataField = (field: string, fieldType?: string) =>
    `${field} ${fieldType ? `must be in ${fieldType} format` : 'is invalid'}`

export const invalidDataFieldInArray = (field: string, fieldType?: string) =>
    `each value in ${field} array ${fieldType ? `must be in ${fieldType} format` : 'is invalid'}`

export const existedDataField = (field: string) => `${field} already exists`

export const minLengthDataField = (field: string, min: number) => `${field} must be at least ${min} characters long`

export const maxLengthDataField = (field: string, max: number) => `${field} must be at most ${max} characters long`

export const rangeLengthDataField = (field: string, min: number, max: number) =>
    `${field} must be between ${min} and ${max} characters long`

export const enumDataField = (field: string, values: string[]) =>
    `${field} must be one of the following values: ${values.join(', ')}`
