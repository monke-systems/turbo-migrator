import * as util from 'util';
import type { LoggerService } from '@nestjs/common';
import * as chalk from 'chalk';

export enum CONTEXT {
  TRASH = 'trash',
  BOOTSTRAP = 'bootstrap',
}

export type ConsoleConfig = {
  enabledContexts: CONTEXT[];
  disabledContexts: CONTEXT[];
  allContextsEnabled: boolean;
  colors: boolean;
};

const enum OUTPUT {
  STDOUT,
  STDERR,
}

export class Console implements LoggerService {
  private static config = Console.getDefaultConfig();

  static log(msg: unknown, context?: CONTEXT) {
    Console.print(OUTPUT.STDOUT, msg, context);
  }

  static error(msg: unknown, context?: CONTEXT, trace?: string) {
    Console.print(OUTPUT.STDERR, msg, context);
    if (trace !== undefined) {
      Console.printStackTrace(trace);
    }
  }

  static setConfig(c: ConsoleConfig) {
    Console.config = Object.assign(Console.getDefaultConfig(), c);
  }

  log(msg: unknown, context?: CONTEXT) {
    Console.log(msg, context);
  }

  warn(msg: unknown, context?: CONTEXT) {
    Console.log(msg, context);
  }

  error(msg: unknown, trace?: string, context?: CONTEXT) {
    Console.error(msg, context, trace);
  }

  private static print(
    output: OUTPUT,
    toPrint: unknown,
    context: CONTEXT = CONTEXT.TRASH,
  ) {
    const shouldPrint =
      this.config.allContextsEnabled ||
      this.config.enabledContexts.includes(context);
    const inBlacklist = this.config.disabledContexts.includes(context);

    if (inBlacklist || !shouldPrint) {
      return;
    }

    const color = output === OUTPUT.STDERR ? chalk.red : chalk.green;
    const contextF = this.config.colors
      ? color(`[${context}]`)
      : `[${context}]`;
    const textFormatted = util.format(toPrint);

    const formatted = `${contextF.padEnd(30)}| ${textFormatted}\n`;

    switch (output) {
      case OUTPUT.STDOUT:
        process.stdout.write(formatted);
        break;
      case OUTPUT.STDERR:
        process.stderr.write(formatted);
        break;
      default:
    }
  }

  private static printStackTrace(trace: string) {
    process.stderr.write(`${trace}\n`);
  }

  private static getDefaultConfig(): ConsoleConfig {
    return {
      enabledContexts: [],
      disabledContexts: [],
      allContextsEnabled: true,
      colors: true,
    };
  }
}
