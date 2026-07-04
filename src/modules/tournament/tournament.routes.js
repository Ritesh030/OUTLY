const express = require('express')
const { validateTournamentData } = require('../../middleware/tournament/tournament.middleware')
const { create, registerTeam, getAll } = require('./tournament.controller')
const { validateUserJWT } = require('../../middleware/user/user.validate')
const { isOrganizer, isAdminOrOrganizer, isAdmin } = require('../../middleware/user/user.role')

const tournamentRoutes = express.Router()

tournamentRoutes.post('/', validateUserJWT, isAdminOrOrganizer, validateTournamentData, create)
tournamentRoutes.post('/register', validateUserJWT, isAdminOrOrganizer, registerTeam)
tournamentRoutes.get('/', validateUserJWT, getAll)

module.exports = tournamentRoutes