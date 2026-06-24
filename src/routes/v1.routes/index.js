const express = require('express')
const userRouter = require('../../modules/user/user.route')
const teamRouter = require('../../modules/team/team.route')

const v1Router = express.Router()

v1Router.use('/user', userRouter)
v1Router.use('/team', teamRouter)

module.exports = v1Router