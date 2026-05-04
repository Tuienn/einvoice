import { BaseEnvConfiguration } from '@libs/configuration/base-env.config'
import { SigningNodeEnvConfiguration } from '@libs/configuration/signing-node-env.config'
import { ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class Configuration extends BaseEnvConfiguration {
    @ValidateNested()
    @Type(() => SigningNodeEnvConfiguration)
    // Validate trong các obj con
    SIGNING_NODE_CONFIG = new SigningNodeEnvConfiguration()
}

export const CONFIGURATION = new Configuration()

// Đệ quy validate BaseEnvConfiguration và SigningNodeEnvConfiguration
CONFIGURATION.validate()
