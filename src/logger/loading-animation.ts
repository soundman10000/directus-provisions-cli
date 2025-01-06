import { Logger } from './logger'

export class LoadingAnimation {
  private static instance: LoadingAnimation
  private intervalId: NodeJS.Timeout | null = null
  logger: Logger

  public static getInstance(): LoadingAnimation {
    if (!this.instance) {
      this.instance = new LoadingAnimation()
    }
    return this.instance
  }

  constructor(){
    this.logger = Logger.getInstance()
  }

  start(input: string) {
    let dots = ''
    this.intervalId = setInterval(() => {
      dots = dots + '.'
      this.logger.log(`\r${input}${dots}`)
    }, 250)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.logger.log('\n')
    }
  }
}
