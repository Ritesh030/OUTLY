const express = require('express')
const { create, logIn } = require('./user.controller')
const { validateUserData } = require('../../middleware/user/user.middleware')

const userRouter = express.Router()

userRouter.post('/', validateUserData, create)
userRouter.post('/login', validateUserData, logIn)

module.exports = userRouter