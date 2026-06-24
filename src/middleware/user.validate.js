const { StatusCodes } = require("http-status-codes")
const jwt = require('jsonwebtoken')
const { ACCESS_TOKEN_SECRET } = require("../config/server.config")
const { AppError } = require("../utils")

const validateUserJWT = async (req, res, next) => {
      try {
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

            if (!token) {
                  throw new AppError('validateUserJWT', 'user is not login', 'Unidentified user', StatusCodes.UNAUTHORIZED)
            }

            const { id, email } = jwt.verify(token, ACCESS_TOKEN_SECRET);

            req.user = { id, email }

            next()
      } catch (error) {
            next(error)
      }
}

module.exports = {
      validateUserJWT
}