const { StatusCodes } = require("http-status-codes");
const { AppError } = require("../../utils");


const validateUserData = async (req,res,next) => {
      if(!req.body.email || !req.body.password) {
            throw new AppError('ValidationError', 'email and password are required', 'All required fields must be provided', StatusCodes.BAD_REQUEST)
      }

      next()
}

module.exports = {
      validateUserData
}