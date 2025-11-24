const { isEmpty } = require('./utils');

const ERROR_KEYS = {
  400: 'errors.bad_request',
  401: 'errors.unauthorized',
  403: 'errors.forbidden',
  404: 'errors.not_found',
  405: 'errors.method_not_allowed',
  408: 'errors.request_timeout',
  409: 'errors.conflict',
  410: 'errors.gone',
  413: 'errors.payload_too_large',
  415: 'errors.unsupported_media_type',
  422: 'errors.unprocessable_entity',
  429: 'errors.too_many_requests',
  500: 'errors.internal_server_error',
  502: 'errors.bad_gateway',
  503: 'errors.service_unavailable',

  INVALID_CREDENTIALS: 'errors.invalid_credentials',
  EMAIL_NOT_VERIFIED: 'errors.email_not_verified',
  INVALID_OTP: 'errors.invalid_otp',
  RESET_PASSWORD_EXPIRED: 'errors.reset_password_expired',
};

class ErrorHandler extends Error {
  constructor(statusCode, messageKey = '') {
    super();

    this.statusCode = statusCode || 500;
    this.messageKey = messageKey || ERROR_KEYS[statusCode] || ERROR_KEYS[500];
  }

  static from(err) {
    if (err?.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      return new ErrorHandler(409, `errors.${field}_already_exists`);
    }

    if (err?.name === 'ValidationError') {
      const field = Object.keys(err.errors || {})[0];
      return new ErrorHandler(422, `errors.${field}_validation_failed`);
    }

    if (err?.name === 'CastError') {
      return new ErrorHandler(400, `errors.invalid_${err.path}`);
    }

    if (err instanceof ErrorHandler) {
      return err;
    }

    return new ErrorHandler(500, ERROR_KEYS[500]);
  }
}

class ErrorHandlerWithDetails extends Error {
  constructor(statusCode, messageKey = '', code = 'ERROR', email = null) {
    super();
    this.statusCode = statusCode || 500;
    this.messageKey = messageKey || ERROR_KEYS[statusCode] || ERROR_KEYS[500];
    this.code = code;
    this.email = email;
  }
}

module.exports = {
  ERROR_KEYS,
  ErrorHandler,
  ErrorHandlerWithDetails,
};
