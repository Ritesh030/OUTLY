const { StatusCodes } = require("http-status-codes");
const { sendSuccessResponse } = require("../../utils");
const MatchesService = require("./matches.service");

const matchesService = new MatchesService()

const generateFixtures = async (req, res, next) => {
      try {
            const { tournamentId } = req.params
            const userId = req.user.id

            const response = await matchesService.generateFixtures({ tournamentId, userId })

            return sendSuccessResponse(res, StatusCodes.CREATED, "fixture generated", response)
      } catch (error) {
            next(error)
      }
}

const createMatchResult = async (req, res, next) => {
      try {
            const userId = req.user.id
            const {matchId, winnerTeamId, teamARuns, teamAOvers, teamAWickets, teamBRuns, teamBOvers, teamBWickets, resultType, note} = req.body

            const data = {matchId, winnerTeamId, teamARuns, teamAOvers, teamAWickets, teamBRuns, teamBOvers, teamBWickets, resultType, note}

            const response = await matchesService.createMatchResult({userId, data})

            return sendSuccessResponse(res, StatusCodes.CREATED, "match result recorded", response)
      } catch (error) {
            next(error)
      }
}

const changeMatchStatus = async (req, res, next) => {
      try {
            const userId = req.user.id
            const { matchId } = req.params
            const {newStatus} = req.body

            const result = await matchesService.changeMatchStatus({userId, matchId, newStatus})

            return sendSuccessResponse(res, StatusCodes.OK, "status updated", result)
      } catch (error) {
            next(error)
      }
}

const getPointsTable = async (req, res, next) => {
      try {
            const { tournamentId } = req.params

            const result = await matchesService.getPointsTable(tournamentId)

            return sendSuccessResponse(res, StatusCodes.OK, "Points tables generated", result)
      } catch (error) {
            next(error)
      }
}
module.exports = {
      generateFixtures,
      createMatchResult,
      changeMatchStatus,
      getPointsTable
}