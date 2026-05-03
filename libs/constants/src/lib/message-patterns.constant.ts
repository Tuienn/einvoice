export const IDENTITY_MESSAGE_PATTERNS = {
    CREATE_USER: 'identity.create_user',
    CREATE_BULK_USERS: 'identity.create_bulk_users',
    DELETE_BULK_USERS: 'identity.delete_bulk_users',
    GET_USER_BY_ID: 'identity.get_user_by_id',
    DISABLE_USER_BY_ID: 'identity.disable_user_by_id',
    ENABLE_USER_BY_ID: 'identity.enable_user_by_id',
    DELETE_USER_BY_ID: 'identity.delete_user_by_id',
    UPDATE_USER_BY_ID: 'identity.update_user_by_id',
    FILTER_USERS: 'identity.filter_users',
    GET_USERS_BY_IDS: 'identity.GET_USERS_BY_IDS',

    SIGN_IN: 'identity.sign_in',
    REFRESH_TOKEN: 'identity.refresh_token',
    SIGN_OUT: 'identity.sign_out'
} as const

export const COORDINATOR_MESSAGE_PATTERNS = {
    FILTER_ELECTIONS: 'coordinator.filter_elections',
    CREATE_ELECTION: 'coordinator.create_election',
    START_ELECTION: 'coordinator.start_election',
    END_ELECTION: 'coordinator.end_election',
    GET_ELECTION_BY_ID: 'coordinator.get_election_by_id',
    ADD_VOTERS_TO_ELECTION: 'coordinator.add_voters_to_election'
} as const
