const express = require('express')
const { validateUserJWT } = require('../../middleware/user/user.validate')
const { generateFixtures, createMatchResult, changeMatchStatus } = require('./matches.controller')

const matchRouter = express.Router()

matchRouter.post('/result', validateUserJWT, createMatchResult)
matchRouter.patch('/:matchId/status', validateUserJWT, changeMatchStatus)

module.exports = matchRouter