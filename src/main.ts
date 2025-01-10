#!/usr/bin/env node
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as commands from './commands'

yargs(hideBin(process.argv))
  .command(commands.listCommand)
  .command(commands.exportCommand)
  .command(commands.importCommand)
  .command(commands.precedenceCommand)
  .demandCommand()
  .help()
  .argv