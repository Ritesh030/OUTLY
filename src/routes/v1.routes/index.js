const express = require('express')
const userRouter = require('../../modules/user/user.route')
const teamRouter = require('../../modules/team/team.route')
const tournamentRoutes = require('../../modules/tournament/tournament.routes')
const matchRouter = require('../../modules/matches/matches.routes')
const leaderboardRouter = require('../../modules/leaderboard/leaderboard.route')

const v1Router = express.Router()

v1Router.use('/user', userRouter)
v1Router.use('/team', teamRouter)
v1Router.use('/tournament', tournamentRoutes)
v1Router.use('/match', matchRouter)
v1Router.use('/leaderboard', leaderboardRouter)

module.exports = v1Router