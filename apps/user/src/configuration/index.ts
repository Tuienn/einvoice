import { BaseEnvConfiguration } from '@libs/configuration/base-env.config'
import { UserEnvConfiguration } from '@libs/configuration/user-env.config'
import { ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
class Configuration extends BaseEnvConfiguration {
    @ValidateNested()
    @Type(() => UserEnvConfiguration)
    // Validate trong các obj con
    USER_CONFIG = new UserEnvConfiguration()
}

export const CONFIGURATION = new Configuration()

// Đệ quy validate BaseEnvConfiguration và UserEnvConfiguration
CONFIGURATION.validate()

export type TConfiguration = typeof CONFIGURATION
