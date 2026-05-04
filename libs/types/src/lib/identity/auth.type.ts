export type Role = 'ADMIN' | 'VOTER' | 'CANDIDATE'

export type JwtPayload = {
    sub: string
    email: string
    role: Role
    iat?: number //Issued At
    exp?: number //Expires At
}

export type UserPayload = {
    userId: string
    email: string
    role: Role
}

export type RequestWithUser = UserPayload
