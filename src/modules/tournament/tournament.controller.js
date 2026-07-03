const { StatusCodes } = require("http-status-codes")
const { sendSuccessResponse, AppError } = require("../../utils")
const TournamentService = require("../tournament/tournament.service")

const tournamentService = new TournamentService()

const create = async (req, res, next) => {
      try {
            const organizerId = req.user.id
            const { name, formate, status, maxTeams, registrationDeadline, startDate, location, description } = req.body
            const data = { name, organizerId, formate, status, maxTeams, registrationDeadline, startDate, location, description }

            if(status) {
                  if(status != "OPEN") throw new AppError("Tournament status error", "Tournament should be open when creating it", "", StatusCodes.BAD_REQUEST)
            }

            const response = await tournamentService.create(data)

            return sendSuccessResponse(res, StatusCodes.CREATED, "Tournament created", response)
      } catch (error) {
            next(error)
      }
}

module.exports = {
      create
}