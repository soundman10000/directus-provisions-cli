import colors from 'ansi-colors'

class Logger {
  private static instance: Logger 

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  public log(message: string, newline: boolean = true): void {
    process.stdout.write(`${message}${newline ? '\n' : ''}`)
  }

  public logError(message: string): void {
    process.stdout.write(colors.red(`${message}\n`))
  }

  public logSuccess(message: string): void {
    process.stdout.write(colors.green(`${message}\n`))
  }
}

export default Logger