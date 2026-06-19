const { StatusCodes } = require('http-status-codes');

const sendSuccessResponse = (res, statusCode = StatusCodes.OK, message = 'Success', data = {}, error = []) => {
      return res.status(statusCode).json({
            message,
            success: true,
            data,
            error
      });
};

const sendErrorResponse = (res, error) => {
      const statusCode = error.statusCode || error.statuscode || StatusCodes.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Internal Server Error';
      const explanation = error.explanation || [];

      console.error('[ERROR]', message);
      if (error.stack) {
            console.error('[STACK]', error.stack);
      }

      return res.status(statusCode).json({
            message,
            success: false,
            data: {},
            error: Array.isArray(explanation) ? explanation : [explanation]
      });
};

module.exports = {
      sendSuccessResponse,
      sendErrorResponse
};