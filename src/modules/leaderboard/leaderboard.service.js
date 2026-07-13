const { AppError, buildAppError } = require("../../utils")
const { getLeaderboard, rebuildLeaderboard } = require("../../utils/redis/redisLeaderboard")
const TeamRepository = require("../team/team.repository")

class LeaderboardService {
      constructor() {
            this.teamRepository = new TeamRepository()
      }

      async getGlobalTeamLeaderboard({ limit = 10 } = {}) {
            try {
                  const cached = await getLeaderboard(0, limit - 1)
                  if (Array.isArray(cached) && cached.length > 0) return cached

                  const teams = await this.teamRepository.getTeamsForLeaderboard(limit)

                  return teams.map(t => ({ teamId: String(t.id), teamName: String(t.name), wins: t.totalWins }))
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'leaderboard - service', controller: 'getGlobalTeamLeaderboard' })
            }
      }

      async recreateGlobalTeamLeaderboard() {
            try {
                  const cached = await rebuildLeaderboard(this.teamRepository)

                  return cached
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'leaderboard - service', controller: 'recreateGlobalTeamLeaderboard' })
            }
      }
}

module.exports = LeaderboardService