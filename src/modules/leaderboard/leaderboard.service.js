const { getLeaderboard } = require("../../utils/redis/redisLeaderboard")
const TeamRepository = require("../team/team.repository")

class LearderboardService {
      constructor() {
            this.teamRepository = new TeamRepository()
      }

      async getGlobalTeamLeaderboard({ limit = 50 } = {}) {
            const cached = await getLeaderboard(0, limit - 1)
            if (cached) return cached

            // Redis unreachable — fall back to Postgres directly
            const teams = await this.teamRepository.getTeamsForLeaderboard()

            return teams.map(t => ({ teamId: String(t.id), teamName: String(t.name), wins: t.totalWins }))
      }
}

module.exports = LearderboardService