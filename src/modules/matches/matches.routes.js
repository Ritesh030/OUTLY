const express = require('express')
const { validateUserJWT } = require('../../middleware/user/user.validate')
const { generateFixtures, createMatchResult, changeMatchStatus, updateMatchResult, getCompletedMatches } = require('./matches.controller')

const matchRouter = express.Router()

matchRouter.get('/:tournamentId', validateUserJWT, getCompletedMatches)

matchRouter.post('/result', validateUserJWT, createMatchResult)

matchRouter.patch('/:matchId/result', validateUserJWT, updateMatchResult)
matchRouter.patch('/:matchId/status', validateUserJWT, changeMatchStatus)

module.exports = matchRouter