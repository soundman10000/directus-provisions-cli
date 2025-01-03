#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import listCommand from './commands/list'
import exportCommand from './commands/export'
import importCommand from './commands/import'

yargs(hideBin(process.argv))
  .command(listCommand)
  .command(exportCommand)
  .command(importCommand)
  .demandCommand()
  .help()
  .argv