#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import listCommand from './commands/list'
import exportCommand from './commands/export'

yargs(hideBin(process.argv))
  .command(listCommand)
  .command(exportCommand)
  .demandCommand()
  .help()
  .argv