/**
 * Base error
 */
export class BaseError extends Error {}

export class ConfigError extends BaseError {
  /**
   * Constructs an instance of FatalError
   *
   * @param error - Error or error message
   */
  constructor(error: string | Error) {
    if (error instanceof Error) {
      super('\x1b[31m' + error.message + '\x1b[37m');
      this.stack = error.stack;
    } else {
      super('\x1b[31m' + error + '\x1b[37m');
      Error.captureStackTrace(this);
    }
  }
}

/**
 * Library error
 */
export class FatalError extends BaseError {
  /**
   * Constructs an instance of FatalError
   *
   * @param error - Error or error message
   */
  constructor(error: string | Error) {
    if (error instanceof Error) {
      super(error.message);
      this.stack = error.stack;
    } else {
      super(error);
      Error.captureStackTrace(this);
    }
  }
}

/**
 * Access error
 */
export class RequestDenied extends FatalError {
  response: Error;

  /**
   * Constructs an instance of RequestDenied
   *
   * @param response - Response
   */
  constructor(response: Error) {
    super(response);

    this.response = response;
  }
}

/**
 * Webhook error
 */
export class WebhookError extends BaseError {
  /**
   * Constructs an instance of FatalError
   *
   * @param message - Error message
   */
  constructor(message: string) {
    super(message);
    Error.captureStackTrace(this);
  }
}
