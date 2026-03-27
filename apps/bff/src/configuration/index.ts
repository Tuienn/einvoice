import BaseConfiguration from '@libs/configuration/base.config'
import BffConfiguration from '@libs/configuration/bff.config'

class Configuration extends BaseConfiguration {
    BFF_CONFIG = new BffConfiguration()
}

const CONFIGURATION = new Configuration()

export default CONFIGURATION

export type TConfiguration = typeof CONFIGURATION
