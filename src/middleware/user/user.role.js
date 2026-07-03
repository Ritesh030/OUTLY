const { StatusCodes } = require("http-status-codes")
const { AppError } = require("../../utils")

const isOrganizer = async (req, res, next) => {
      try {
            const role = req.user.role

            if(role != 'ORGANIZER') {
                  throw new AppError("User not an Organizer", "Only organizer are allowed to do this task", "", StatusCodes.UNAUTHORIZED)
            }

            next()
      } catch (error) {
            next(error)
      }
}

const isAdmin = async (req, res, next) => {
      try {
            const role = req.user.role

            if(role != 'ADMIN') {
                  throw new AppError("User not an admin", "Only admin can do this task", "", StatusCodes.UNAUTHORIZED)
            }

            next()
      } catch (error) {
            next(error)
      }
}

const isAdminOrOrganizer = async (req, res, next) => {
      try {
            const role = req.user.role

            if(role != 'ADMIN' && role != 'ORGANIZER') {
                  throw new AppError("User not an Organizer or admin", "Only organizer and admin can do this task", "", StatusCodes.UNAUTHORIZED)
            }

            next()
      } catch (error) {
            next(error)
      }
}

module.exports = {
      isOrganizer,
      isAdmin,
      isAdminOrOrganizer
}