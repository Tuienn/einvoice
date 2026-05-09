export const ROLE = {
    ADMIN: 'ADMIN',
    VOTER: 'VOTER',
    CANDIDATE: 'CANDIDATE'
} as const

export const ROLE_ARRAY = [ROLE.ADMIN, ROLE.VOTER, ROLE.CANDIDATE]

export const ROLES_KEY = 'roles'
