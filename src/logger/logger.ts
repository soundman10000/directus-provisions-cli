import { LoadingAnimation } from './loading-animation'
import colors from 'ansi-colors';

export class Logger {
  private static instance: Logger 

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  public log(message: string): void {
    process.stdout.write(`${message}\n`)
  }

  public logError(message: string): void {
    process.stdout.write(colors.red(`${message}\n`))
  }
}