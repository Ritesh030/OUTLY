const express = require('express')
const { validateTournamentData } = require('../../middleware/tournament/tournament.middleware')
const {create} = require('./tournament.controller')
const { validateUserJWT } = require('../../middleware/user/user.validate')
const { isOrganizer, isAdminOrOrganizer } = require('../../middleware/user/user.role')

const tournamentRoutes = express.Router()

tournamentRoutes.post('/', validateUserJWT, isAdminOrOrganizer , validateTournamentData, create)

module.exports = tournamentRoutes