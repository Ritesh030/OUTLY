const express = require('express')
const { create, addPlayer, removePlayer, assignCaptain } = require('./team.controller')
const { validateUserJWT } = require('../../middleware/user/user.validate')

const teamRouter = express.Router()

teamRouter.post('/', validateUserJWT, create)
teamRouter.patch('/players', validateUserJWT, addPlayer)
teamRouter.delete('/players', validateUserJWT, removePlayer)
teamRouter.patch('/captain', validateUserJWT, assignCaptain)

module.exports = teamRouter