const express = require('express')
const { validateUserJWT } = require('../../middleware/user/user.validate')
const { getGlobalTeamLeaderboard, recreateGlobalTeamLeaderboard } = require('./leaderboard.controller')

const leaderboardRouter = express.Router()

leaderboardRouter.get('/globalteams', validateUserJWT, getGlobalTeamLeaderboard)

leaderboardRouter.put('/globalteams/rebuild', validateUserJWT, recreateGlobalTeamLeaderboard)

module.exports = leaderboardRouter