import { format } from 'util';

export type LoggerOpts = {
  enableBuffer: boolean;
};

const defaultLoggerOpts: LoggerOpts = {
  enableBuffer: true,
};

export class Logger {
  private buffer: string[] = [];

  constructor(private opts: LoggerOpts = defaultLoggerOpts) {}

  info(...args: unknown[]) {
    const message = `info: ${args.map((a) => format(a)).join(' ')}\n`;

    if (this.opts.enableBuffer) {
      this.buffer.push(message);
    } else {
      process.stdout.write(message);
    }
  }

  error(...args: unknown[]) {
    const message = `error: ${args.map((a) => format(a)).join(' ')}\n`;

    if (this.opts.enableBuffer) {
      this.buffer.push(message);
    } else {
      process.stderr.write(message);
    }
  }

  flushBuffer(): string[] {
    const cloned = [...this.buffer];
    this.buffer = [];
    return cloned;
  }
}
