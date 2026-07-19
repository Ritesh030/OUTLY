const redisClient = require('../../config/redis.config')
const { POINTS_TABLE_KEY } = require('../../config/server.config')

async function getPointsTableFromCache(tournamentId) {
      try {
            const key = `${POINTS_TABLE_KEY}:${tournamentId}`

            // // Check poison pill — if exists, bypass cache
            // const isStale = await redisClient.get(`stale:${key}`) // not needed for now since we are serving old data till worker recalculates the standings
            // if (isStale) return null

            const data = await redisClient.get(key)
            return data ? JSON.parse(data) : null
      } catch {
            return null
      }
}

async function setPointsTableInRedis(tournamentId, data) {
      try {
            const key = `${POINTS_TABLE_KEY}:${tournamentId}`

            await redisClient.pipeline()
                  .set(key, JSON.stringify(data), 'EX', 3600)
                  .del(`stale:${key}`) 
                  .exec()

            console.log(`Points table cached successfully in redis for tournamentId: ${tournamentId}`)
      } catch (error) {
            console.error('Redis points table update failed:', error)
      }
}

async function clearPointsTableCache(tournamentId) {
      const key = `${POINTS_TABLE_KEY}:${tournamentId}`

      // Try 3 times
      for (let i = 0; i < 3; i++) {
            try {
                  await redisClient.del(key)
                  console.log(`Points table deleted from cache for tournamentId: ${tournamentId}`)
                  return 
            } catch {
                  console.error(`Del attempt ${i + 1} failed`)
                  await new Promise(res => setTimeout(res, 100 * (i + 1)))
            }
      }

      try {
            await redisClient.set(`stale:${key}`, 'true', 'EX', 60)
      } catch {
            console.error('Poison pill also failed — stale data for up to 1 hour')
      }
}

module.exports = {
      getPointsTableFromCache,
      setPointsTableInRedis,
      clearPointsTableCache
}