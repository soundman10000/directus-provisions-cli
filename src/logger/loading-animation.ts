import { Logger } from './logger'

export class LoadingAnimation {
  private intervalId: NodeJS.Timeout | null = null
  logger: Logger

  constructor(){
    this.logger = Logger.getInstance()
  }

  start(input: string) {
    let dots = ''
    this.intervalId = setInterval(() => {
      dots = dots + '.'
      this.logger.log(`\r${input}${dots}`, false)
    }, 250)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.logger.log('\n', false)
    }
  }
}
