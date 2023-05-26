export type LOG_LEVEL = 'DEBUG' | 'LOG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export class Logger {
  logLevel: LOG_LEVEL;
  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LOG_LEVEL) || 'INFO';
  }
  debug(message: unknown) {
    if (this.logLevel === 'DEBUG') {
      console.debug(`DEBUG: ${message.toString()}`);
    }
  }
  log(message: unknown) {
    if (this.logLevel === 'LOG' || this.logLevel === 'DEBUG') {
      console.log(`LOG: ${message.toString()}`);
    }
  }
  info(message: unknown) {
    if (
      this.logLevel === 'INFO' ||
      this.logLevel === 'LOG' ||
      this.logLevel === 'DEBUG'
    ) {
      console.info(`INFO: ${message.toString()}`);
    }
  }
  warn(message: unknown) {
    if (
      this.logLevel === 'WARN' ||
      this.logLevel === 'INFO' ||
      this.logLevel === 'LOG' ||
      this.logLevel === 'DEBUG'
    ) {
      console.warn(`WARNING: #${message.toString()}`);
    }
  }
  error(message: unknown) {
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
  fatal(message: unknown) {
    if (
      this.logLevel === 'FATAL' ||
      this.logLevel === 'ERROR' ||
      this.logLevel === 'WARN' ||
      this.logLevel === 'INFO' ||
      this.logLevel === 'LOG' ||
      this.logLevel === 'DEBUG'
    ) {
      console.error(`FATAL: ${message.toString()}`);
    }
  }
}
