const { StatusCodes } = require("http-status-codes");
const { sendSuccessResponse } = require("../../utils");
const LearderboardService = require("./leaderboard.service");

const learderboardService = new LearderboardService()

const getGlobalTeamLeaderboard = async (req, res, next) => {
      try {
            const response = await learderboardService.getGlobalTeamLeaderboard()

            sendSuccessResponse(res, StatusCodes.OK, "Learder board fetched", response)
      } catch (error) {
            next(error)
      }
}

module.exports = {
      getGlobalTeamLeaderboard
}