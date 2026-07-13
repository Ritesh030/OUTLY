const express = require('express')
const { validateUserJWT } = require('../../middleware/user/user.validate')
const { getGlobalTeamLeaderboard } = require('./leaderboard.controller')

const leaderboardRouter = express.Router()

leaderboardRouter.get('/globalteams', validateUserJWT, getGlobalTeamLeaderboard)

module.exports = leaderboardRouter