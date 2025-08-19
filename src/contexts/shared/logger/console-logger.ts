/* eslint-disable no-console */
import { Logger } from "./logger";

export class ConsoleLogger implements Logger {
  info(message: string, attributes: unknown = {}) {
    const msg = {
      level: "info",
      message,
      attributes,
      timestamp: new Date().toISOString()
    };

    console.log(msg);
  }

  error(message: string, attributes: unknown = {}) {
    const msg = {
      level: "error",
      message,
      attributes,
      timestamp: new Date().toISOString()
    };

    console.error(msg);
  }

  warn(message: string, attributes: unknown = {}) {
    const msg = {
      level: "warn",
      message,
      attributes,
      timestamp: new Date().toISOString()
    };

    console.warn(msg);
  }

  debug(message: string, attributes: unknown = {}) {
    const msg = {
      level: "debug",
      message,
      attributes,
      timestamp: new Date().toISOString()
    };

    console.debug(msg);
  }
}
