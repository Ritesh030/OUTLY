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
      try {
            const key = LEADERBOARD_KEY
            const script = `
                  local cur = tonumber(redis.call('ZSCORE', KEYS[1], ARGV[1])) or 0
                  local newScore = cur - tonumber(ARGV[2])
                  if newScore < 0 then newScore = 0 end
                  redis.call('ZADD', KEYS[1], newScore, ARGV[1])
                  return newScore
            `
            await redisClient.eval(script, 1, key, String(teamId), by)
      } catch (err) {
            console.error('Redis leaderboard update failed:', err)
      }
}

async function getLeaderboard(start = 0, stop = -1) {
      try {
            const raw = await redisClient.zrevrange(LEADERBOARD_KEY, start, stop, 'WITHSCORES')
            const leaderboard = []
            for (let i = 0; i < raw.length; i += 2) {
                  leaderboard.push({ teamId: raw[i], wins: Number(raw[i + 1]) })
            }
            return leaderboard
      } catch (err) {
            console.error('Redis leaderboard read failed:', err)
            return []
      }
}

async function getTeamRank(teamId) {
      try {
            const rank = await redisClient.zrevrank(LEADERBOARD_KEY, String(teamId))
            return rank === null ? null : rank + 1
      } catch (err) {
            console.error('Redis team rank lookup failed:', err)
            return null
      }
}

async function rebuildLeaderboard(teamRepository) {
      try {
            const teams = await teamRepository.getTeamsForLeaderboard()

            const pipeline = redisClient.pipeline()
            pipeline.del(LEADERBOARD_KEY)
            for (const team of teams) {
                  if (Number(team.totalWins) > 0) {
                        pipeline.zadd(LEADERBOARD_KEY, Number(team.totalWins), String(team.id))
                  }
            }
            await pipeline.exec()

            return teams.filter(team => Number(team.totalWins) > 0).length
      } catch (err) {
            console.error('Redis leaderboard rebuild failed:', err)
            return 0
      }
}

module.exports = { incrementTeamScore, decrementTeamScore, getLeaderboard, getTeamRank, rebuildLeaderboard }