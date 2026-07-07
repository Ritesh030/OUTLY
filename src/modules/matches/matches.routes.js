const express = require('express')
const { validateUserJWT } = require('../../middleware/user/user.validate')
const { generateFixtures } = require('./matches.controller')

const matchRouter = express.Router()

matchRouter.post('/:tournamentId/fixture', validateUserJWT, generateFixtures)

module.exports = matchRouter