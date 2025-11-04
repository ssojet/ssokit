/**
 * Base error class for all AuthKit errors
 */
export class AuthKitError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'AuthKitError';
    Object.setPrototypeOf(this, AuthKitError.prototype);
  }
}

/**
 * Configuration error - missing or invalid environment variables
 */
export class ConfigError extends AuthKitError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR', 500);
    this.name = 'ConfigError';
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}

/**
 * API client error - network or response errors
 */
export class ApiError extends AuthKitError {
  constructor(
    message: string,
    statusCode: number,
    public readonly response?: unknown
  ) {
    super(message, 'API_ERROR', statusCode);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Validation error - schema validation failures
 */
export class ValidationError extends AuthKitError {
  constructor(message: string, public readonly issues?: unknown[]) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Webhook verification error
 */
export class WebhookVerificationError extends AuthKitError {
  constructor(message: string) {
    super(message, 'WEBHOOK_VERIFICATION_ERROR', 401);
    this.name = 'WebhookVerificationError';
    Object.setPrototypeOf(this, WebhookVerificationError.prototype);
  }
}

/**
 * SCIM operation error
 */
export class ScimError extends AuthKitError {
  constructor(
    message: string,
    statusCode: number,
    public readonly scimType?: string
  ) {
    super(message, 'SCIM_ERROR', statusCode);
    this.name = 'ScimError';
    Object.setPrototypeOf(this, ScimError.prototype);
  }
}
