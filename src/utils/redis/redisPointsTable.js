const redisClient = require('../../config/redis.config')
const { POINTS_TABLE_KEY } = require('../../config/server.config')

async function getPointsTableFromRedis(tournamentId) {
      try {
            const key = `${POINTS_TABLE_KEY}:${tournamentId}`

            const rawData = await redisClient.get(key);
            return rawData ? JSON.parse(rawData) : null;
      } catch (error) {
            console.error('Redis points Table fetch failed:', error)
            return null
      }
}

async function setPointsTableInRedis(tournamentId, data) {
      try {
            const key = `${POINTS_TABLE_KEY}:${tournamentId}`

            await redisClient.set(key, JSON.stringify(data), 'EX', 3600)

            console.log(`Points table cached successfully in redis for tournamentId: ${tournamentId}`)
      } catch (error) {
            console.error('Redis points table update failed:', error)
      }
}

async function clearPointsTableCache(tournamentId, retries = 3) {
      const key = `${POINTS_TABLE_KEY}:${tournamentId}`;

      await redisClient.del(key);
      console.log(`[Redis]: Cache cleared safely.`);
}

module.exports = {
      getPointsTableFromRedis,
      setPointsTableInRedis,
      clearPointsTableCache
}