const { StatusCodes } = require("http-status-codes")
const { sendSuccessResponse, AppError } = require("../../utils")
const TournamentService = require("../tournament/tournament.service")

const tournamentService = new TournamentService()

const create = async (req, res, next) => {
      try {
            const organizerId = req.user.id
            const { name, formate, maxTeams, playerPerTeam, registrationDeadline, startDate, location, description } = req.body
            const data = { name, organizerId, formate, maxTeams, playerPerTeam, registrationDeadline, startDate, location, description }

            const response = await tournamentService.create(data)

            return sendSuccessResponse(res, StatusCodes.CREATED, "Tournament created", response)
      } catch (error) {
            next(error)
      }
}

const registerTeam = async (req, res, next) => {
      try {
            const { tournamentId, teamId } = req.body
            const tournament = await tournamentService.registerTeam({tournamentId, teamId})

            return sendSuccessResponse(res, StatusCodes.OK, "Team registered", tournament)
      } catch (error) {
            next(error)
      }
}

const getAll = async (req, res, next) => {
      try {
            const tournaments = await tournamentService.getAll()

            return sendSuccessResponse(res, StatusCodes.OK, "Tournaments fetched", tournaments)
      } catch (error) {
            next(error)
      }
}

const updateStatus = async (req, res, next) => {
      try {
            const {tournamentId, newStatus} = req.body
            const response = await tournamentService.updateStatus({tournamentId, newStatus})

            return sendSuccessResponse(res, StatusCodes.OK, "status updated", response)
      } catch (error) {
            next(error)
      }
}

module.exports = {
      create,
      registerTeam,
      getAll,
      updateStatus
}