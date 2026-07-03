const { StatusCodes } = require("http-status-codes")
const { AppError } = require("../../utils")

const validateTournamentData = async (req, res, next) => {
      try {
            const data = req.body

            if(!data.name || !data.maxTeams) {
                  throw new AppError("All fields are required", "Name and maxTeams not spqcified", "", StatusCodes.BAD_REQUEST)
            }

            next()
      } catch (error) {
            next(error)
      }
}

module.exports = {
      validateTournamentData
}