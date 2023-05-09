export type LOG_LEVEL = 'DEBUG' | 'LOG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export class Logger {
  logLevel: LOG_LEVEL;
  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LOG_LEVEL) || 'INFO';
  }
  debug(message: string) {
    if (this.logLevel === 'DEBUG') {
      console.debug(`DEBUG: ${message}`);
    }
  }
  log(message: string) {
    if (this.logLevel === 'LOG' || this.logLevel === 'DEBUG') {
      console.log(`LOG: ${message}`);
    }
  }
  info(message: string) {
    if (
      this.logLevel === 'INFO' ||
      this.logLevel === 'LOG' ||
      this.logLevel === 'DEBUG'
    ) {
      console.info(`INFO: ${message}`);
    }
  }
  warn(message: string) {
    if (
      this.logLevel === 'WARN' ||
      this.logLevel === 'INFO' ||
      this.logLevel === 'LOG' ||
      this.logLevel === 'DEBUG'
    ) {
      console.warn(`WARNING: #${message}`);
    }
  }
  error(message: string) {
    if (
      this.logLevel === 'ERROR' ||
      this.logLevel === 'WARN' ||
      this.logLevel === 'INFO' ||
      this.logLevel === 'LOG' ||
      this.logLevel === 'DEBUG'
    ) {
      console.error(`ERROR: ${message.toString()}`);
    }
  }
  fatal(message: string) {
    if (
      this.logLevel === 'FATAL' ||
      this.logLevel === 'ERROR' ||
      this.logLevel === 'WARN' ||
      this.logLevel === 'INFO' ||
      this.logLevel === 'LOG' ||
      this.logLevel === 'DEBUG'
    ) {
      console.error(`FATAL: ${message}`);
    }
  }
}
