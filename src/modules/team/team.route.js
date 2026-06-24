const express = require('express')
const { create, addPlayer, removePlayer } = require('./team.controller')
const { validateUserJWT } = require('../../middleware/user.validate')

const teamRouter = express.Router()

teamRouter.post('/', validateUserJWT, create)
teamRouter.patch('/players', validateUserJWT, addPlayer)
teamRouter.delete('/players', validateUserJWT, removePlayer)

module.exports = teamRouter