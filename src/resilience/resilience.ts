export class Resilience {
  private retries: number;
  private timeout: number;

  constructor(retries: number = 3, timeout: number = 1000) {
    this.retries = retries;
    this.timeout = timeout;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let attempts = 0;
    while (attempts < this.retries) {
      try {
        return await this.withTimeout(fn);
      } catch (error) {
        attempts++;
        if (attempts >= this.retries) {
          throw error;
        }
        console.warn(`Attempt ${attempts} failed. Retrying...`);
        await this.delay(this.timeout);
      }
    }
    throw new Error('Max retries reached');
  }

  private withTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Operation timed out'));
      }, this.timeout);

      fn().then(
        (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}