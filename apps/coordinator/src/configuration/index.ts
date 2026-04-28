import { BaseEnvConfiguration } from '@libs/configuration/base-env.config'
import { CoordinatorEnvConfiguration } from '@libs/configuration/coordinator-env.config'
import { ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class Configuration extends BaseEnvConfiguration {
    @ValidateNested()
    @Type(() => CoordinatorEnvConfiguration)
    // Validate trong các obj con
    COORDINATOR_CONFIG = new CoordinatorEnvConfiguration()
}

export const CONFIGURATION = new Configuration()

// Đệ quy validate BaseEnvConfiguration và CoordinatorEnvConfiguration
CONFIGURATION.validate()
