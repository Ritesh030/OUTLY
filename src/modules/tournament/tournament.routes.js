const express = require('express')
const { validateTournamentData } = require('../../middleware/tournament/tournament.middleware')
const { create, registerTeam, getAll, updateStatus } = require('./tournament.controller')
const { validateUserJWT } = require('../../middleware/user/user.validate')
const { isOrganizer, isAdminOrOrganizer, isAdmin } = require('../../middleware/user/user.role')
const { generateFixtures } = require('../matches/matches.controller')

const tournamentRoutes = express.Router()

tournamentRoutes.post('/', validateUserJWT, isAdminOrOrganizer, validateTournamentData, create)
tournamentRoutes.post('/register', validateUserJWT, isAdminOrOrganizer, registerTeam)
tournamentRoutes.post('/:tournamentId/fixture', validateUserJWT, generateFixtures)
tournamentRoutes.get('/', validateUserJWT, getAll)
tournamentRoutes.patch('/status', validateUserJWT, isAdminOrOrganizer, updateStatus)

module.exports = tournamentRoutes