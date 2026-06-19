class AppError extends Error {
      constructor(name, message, explanation = '', statusCode = 500) {
            super(message);
            this.name = name;
            this.message = message;
            this.explanation = explanation;
            this.statusCode = statusCode;

            Error.captureStackTrace(this, this.constructor);
      }
}

module.exports = AppError;