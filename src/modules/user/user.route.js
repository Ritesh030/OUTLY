const express = require('express')
const { create, logIn, getById, getAll } = require('./user.controller')
const { validateUserData } = require('../../middleware/user/user.middleware')
const { validateUserJWT } = require('../../middleware/user/user.validate')
const { isAdmin } = require('../../middleware/user/user.role')

const userRouter = express.Router()

userRouter.post('/', validateUserData, create)
userRouter.post('/login', validateUserData, logIn)
userRouter.get('/', validateUserJWT, isAdmin, getAll)
userRouter.get('/:id', validateUserJWT, isAdmin, getById)

module.exports = userRouter