const { StatusCodes } = require('http-status-codes')
const { sendSuccessResponse } = require('../../utils')
const UserService = require('./user.service')

const userService = new UserService()

const cookieOptions = {
      httpOnly: true,     // Protects against XSS attacks
      sameSite: 'strict', // Protects against CSRF attacks
      // secure: true // false for testing
}

const create = async (req, res, next) => {
      try {
            const data = req.body
            const response = await userService.create(data)

            const cleanResponse = { role: response.role, name: response.name, id: response.id, email: response.email }

            return sendSuccessResponse(res, StatusCodes.CREATED, "User created", cleanResponse)
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

const getById = async (req, res, next) => {
      try {
            const { id } = req.params

            const user = await userService.getById(id)

            return sendSuccessResponse(res, StatusCodes.OK, "User fetched", user)
      } catch (error) {
            next(error)
      }
}

const getAll = async (req, res, next) => {
      try {
            const users = await userService.getAll()

            return sendSuccessResponse(res, StatusCodes.OK, "Users fetched", users)
      } catch (error) {
            next(error)
      }
}

module.exports = {
      create,
      logIn,
      getAll,
      getById
}