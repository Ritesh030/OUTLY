const { StatusCodes } = require('http-status-codes')
const { sendSuccessResponse } = require('../../utils')
const UserService = require('./user.service')

const userService = new UserService()

const cookieOptions = {
      httpOnly: true,     // Protects against XSS attacks
      sameSite: 'strict', // Protects against CSRF attacks
      secure: true
}

const create = async (req, res, next) => {
      try {
            const data = req.body
            const response = await userService.create(data)

            return sendSuccessResponse(res, StatusCodes.CREATED, "User created", response)
      } catch (error) {
            next(error)
      }
}

const logIn = async (req, res, next) => {
      try {
            const { email, password } = req.body
            const response = await userService.login({ email, password })

            res.cookie('accessToken', response.accessToken, {
                  ...cookieOptions,
                  maxAge: 15 * 60 * 1000 
            })

            res.cookie('refreshToken', response.refreshToken, {
                  ...cookieOptions,
                  maxAge: 7 * 24 * 60 * 60 * 1000 
            })

            const clientResponse = { ...response }
            delete clientResponse.accessToken
            delete clientResponse.refreshToken

            return sendSuccessResponse(res, StatusCodes.OK, "Login successfully", clientResponse)
      } catch (error) {
            next(error)
      }
}

module.exports = {
      create,
      logIn
}