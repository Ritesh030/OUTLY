const express = require('express')
const userRouter = require('../../modules/user/user.route')
const teamRouter = require('../../modules/team/team.route')
const tournamentRoutes = require('../../modules/tournament/tournament.routes')
const matchRouter = require('../../modules/matches/matches.routes')

const v1Router = express.Router()

v1Router.use('/user', userRouter)
v1Router.use('/team', teamRouter)
v1Router.use('/tournament', tournamentRoutes)
v1Router.use('/match', matchRouter)

module.exports = v1Router