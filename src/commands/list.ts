import { CommandModule } from 'yargs';
import { DirectusClient } from '../directus-client/directus';

const command: CommandModule = {
  command: 'list [collection]',
  describe: 'List items from a collection',
  builder: (yargs) => {
    return yargs
      .positional('collection', {
        describe: 'The collection name',
        type: 'string',
        demandOption: true
      });
  },
  handler: async (argv) => {
    const client = new DirectusClient();
    try {
      await client.login()
      await client.listItems(argv.collection as string);
    } catch (error) {
      console.error('Command failed:', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      process.exit(0);
    }
  }
};

export default command;