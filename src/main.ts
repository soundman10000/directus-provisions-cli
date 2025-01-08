#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import listCommand from './commands/list'
import exportCommand from './commands/export'
import importCommand from './commands/import'
import precedenceCommand from './commands/precedence'

yargs(hideBin(process.argv))
  .command(listCommand)
  .command(exportCommand)
  .command(importCommand)
  .command(precedenceCommand)
  .demandCommand()
  .help()
  .argv