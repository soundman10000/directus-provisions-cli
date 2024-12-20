// commands/list.ts
import { CommandModule } from 'yargs';

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
    console.log(argv);
  }
};

export default command;