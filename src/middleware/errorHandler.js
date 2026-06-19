const { StatusCodes } = require('http-status-codes');
const { sendErrorResponse } = require('../utils/index');

const errorHandler = (err, req, res, next) => {
      return sendErrorResponse(res, err)
};

module.exports = errorHandler;