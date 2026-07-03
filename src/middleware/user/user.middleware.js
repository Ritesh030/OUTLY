const { StatusCodes } = require("http-status-codes")

function isgmail(email) {
            return /^[^@]+@gmail\.com$/.test(email);
}

const validateUserData = async (req,res,next) => {
      if(!req.body.email || !req.body.password) {
            throw new AppError('ValidationError', 'email and password are required', 'All required fields must be provided', StatusCodes.BAD_REQUEST)
      }

      if(!isgmail(req.body.email)) {
            throw new AppError('ValidationError', 'enter a vailid email', 'invalide email', StatusCodes.BAD_REQUEST)
      }

      next()
}

module.exports = {
      validateUserData
}