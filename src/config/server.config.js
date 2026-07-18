const dotenv = require('dotenv')

dotenv.config()

module.exports = {
      PORT: process.env.PORT,

      ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
      ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
      REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
      REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,

      LEADERBOARD_KEY: process.env.LEADERBOARD_KEY,
      POINTS_TABLE_KEY: process.env.POINTS_TABLE_KEY
}