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

module.exports = {
      generateFixtures
}