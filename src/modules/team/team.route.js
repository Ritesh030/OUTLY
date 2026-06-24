const express = require('express')
const { create } = require('./team.controller')
const { validateUserJWT } = require('../../middleware/user.validate')

const teamRouter = express.Router()

teamRouter.post('/', validateUserJWT, create)

module.exports = teamRouter