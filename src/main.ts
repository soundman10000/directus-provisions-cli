#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import command from './commands/list';

yargs(hideBin(process.argv))
  .command(command)
  .demandCommand()
  .help()
  .argv;