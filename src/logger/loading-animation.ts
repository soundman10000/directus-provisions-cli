export class LoadingAnimation {
  private intervalId: NodeJS.Timeout | null = null

  start(input: string) {
    let dots = ''
    this.intervalId = setInterval(() => {
      dots = dots + '.'
      process.stdout.write(`\r${input}${dots}`)
    }, 250)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      process.stdout.write('\n')
    }
  }
}
