import { Utilities } from './Utilities.ts'

export interface LoggerMetaInterface {
  service: string
  event?: Event
  error?: Error
}

type LogLevel = 'ERROR' | 'INFO' | 'DEBUG'

export class ApplicationLogger {
  public static logLevel: LogLevel = 'INFO'

  static formatMessage(level: string, message: string, meta: LoggerMetaInterface): string {
    return `${Utilities.getFormattedDate()} [${level.padEnd(6, ' ')}] [${meta.service.padEnd(20, ' ')}] ${message}`
  }

  static debug(message: string, meta: LoggerMetaInterface) {
    if (this.logLevel >= 'DEBUG') {
      console.log(this.formatMessage('DEBUG', message, meta))
    }
  }

  static info(message: string, meta: LoggerMetaInterface) {
    if (this.logLevel >= 'INFO') {
      console.log(this.formatMessage('INFO', message, meta))
    }
  }

  static error(message: string, meta: LoggerMetaInterface) {
    if (this.logLevel >= 'ERROR') {
      console.error(this.formatMessage('ERROR', message, meta))
    }
  }

  static warn(message: string, meta: LoggerMetaInterface) {
    if (this.logLevel >= 'INFO') {
      console.warn(this.formatMessage('WARN', message, meta))
    }
  }
}
