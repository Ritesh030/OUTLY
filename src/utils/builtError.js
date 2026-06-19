const { StatusCodes } = require('http-status-codes');
const AppError = require('./AppError');

const extractValidationMessages = (error) => {
      if (error.errors && Array.isArray(error.errors)) {
            return error.errors.map(err => err.message || err.toString());
      }
      return [error.message || 'Validation failed'];
};

const buildAppError = (error, context = {}) => {
      // If it's already an AppError
      if (error instanceof AppError) {
            return error;
      }

      const { serviceName = 'FlightSearchService', controllerName = 'unknown' } = context;

      // Log error with context
      console.error(`[ERROR] ${serviceName}.${controllerName}`);
      console.error(`Message: ${error.message}`);
      if (error.stack) {
            console.error(`Stack: ${error.stack}`);
      }

      // Handle Sequelize Validation Error
      if (error.name === 'SequelizeValidationError') {
            const explanation = [];
            if (error.errors && Array.isArray(error.errors)) {
                  error.errors.forEach(err => {
                        explanation.push(err.message || err.toString());
                  });
            }
            return new AppError(
                  'ValidationError',
                  'Validation failed',
                  explanation,
                  StatusCodes.BAD_REQUEST
            );
      }

      // Handle Sequelize Unique Constraint Error
      if (error.name === 'SequelizeUniqueConstraintError') {
            const explanation = [];
            if (error.errors && Array.isArray(error.errors)) {
                  error.errors.forEach(err => {
                        explanation.push(err.message || err.toString());
                  });
            }
            return new AppError(
                  'UniqueConstraintError',
                  'Duplicate entry',
                  explanation,
                  StatusCodes.CONFLICT
            );
      }

      // Handle Sequelize Foreign Key Constraint Error
      if (error.name === 'SequelizeForeignKeyConstraintError') {
            return new AppError(
                  'ForeignKeyError',
                  'Invalid reference',
                  [error.message || 'Foreign key constraint violation'],
                  StatusCodes.BAD_REQUEST
            );
      }

      // Handle Sequelize Database Error
      if (error.name === 'SequelizeDatabaseError') {
            return new AppError(
                  'DatabaseError',
                  'Database operation failed',
                  [error.message || 'Database error occurred'],
                  StatusCodes.INTERNAL_SERVER_ERROR
            );
      }

      // Generic error fallback
      return new AppError(
            'InternalError',
            error.message || 'An unexpected error occurred',
            [error.message || 'Unknown error'],
            StatusCodes.INTERNAL_SERVER_ERROR
      );
};

module.exports = {
      buildAppError,
      extractValidationMessages
};