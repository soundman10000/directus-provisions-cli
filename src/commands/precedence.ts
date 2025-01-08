import { CommandModule } from "yargs"
import { PrecedenceService } from '../service/precedence-service'
import { Logger } from '../logger/logger'

interface CommandArgs {
  env: string
}

const command: CommandModule<{}, CommandArgs> = {
  command: 'precedence [env]',
  describe: 'List Directus Collection Precedence',
  builder: (yargs) => {
    return yargs
      .positional('env', {
        describe: 'The environment to use',
        type: 'string',
        demandOption: true
      })
  },
  handler: async (argv: CommandArgs) => {
    const logger = Logger.getInstance()
    const service = new PrecedenceService(argv.env)

    try {
      var collections = await service.listCollectionsPrecedence()
      logger.log(JSON.stringify(collections, null, 2))
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'An unknown error occurred'
      logger.logError(`Command failed: ${msg}`)
    } finally {
      process.exit(0)
    }
  }
}

export default command