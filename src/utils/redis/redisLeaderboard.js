const redisClient = require('../../config/redis.config')
const { LEADERBOARD_KEY } = require('../../config/server.config')

async function incrementTeamScore(teamId, by = 1) {
      try {
            await redisClient.zincrby(LEADERBOARD_KEY, by, String(teamId))
      } catch (err) {
            console.error('Redis leaderboard update failed:', err)
      }
}

async function decrementTeamScore(teamId, by = 1) {
      return incrementTeamScore(teamId, -by)
}

async function getLeaderboard(start = 0, stop = -1) {
      const raw = await redisClient.zrevrange(LEADERBOARD_KEY, start, stop, 'WITHSCORES')
      const leaderboard = []
      for (let i = 0; i < raw.length; i += 2) {
            leaderboard.push({ teamId: raw[i], wins: Number(raw[i + 1]) })
      }
      return leaderboard
}

async function getTeamRank(teamId) {
      const rank = await redisClient.zrevrank(LEADERBOARD_KEY, String(teamId))
      return rank === null ? null : rank + 1 
}

module.exports = { incrementTeamScore, decrementTeamScore, getLeaderboard, getTeamRank, LEADERBOARD_KEY }