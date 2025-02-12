import Logger from './logger'

class LoadingAnimation {
  private intervalId: NodeJS.Timeout | null = null
  logger: Logger

  constructor(){
    this.logger = Logger.getInstance()
  }

  start(input: string) {
    this.logger.log(input, false)

    let dots = ''
    this.intervalId = setInterval(() => {
      dots += '.'
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

export default LoadingAnimation