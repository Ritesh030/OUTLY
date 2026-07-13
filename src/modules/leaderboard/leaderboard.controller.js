const { StatusCodes } = require("http-status-codes");
const { sendSuccessResponse } = require("../../utils");
const LeaderboardService = require("./leaderboard.service");
const leaderboardRouter = require("./leaderboard.route");

const leaderboardService = new LeaderboardService()

const getGlobalTeamLeaderboard = async (req, res, next) => {
      try {
            const response = await leaderboardService.getGlobalTeamLeaderboard()

            sendSuccessResponse(res, StatusCodes.OK, "Learder board fetched", response)
      } catch (error) {
            next(error)
      }
}

const recreateGlobalTeamLeaderboard = async (req, res, next) => {
      try {
            const response = await leaderboardRouter.recreateGlobalTeamLeaderboard();

            sendSuccessResponse(res, StatusCodes.OK, "Leaderboard recreated", response)
      } catch (error) {
            next(error)
      }
}

module.exports = {
      getGlobalTeamLeaderboard,
      recreateGlobalTeamLeaderboard
}