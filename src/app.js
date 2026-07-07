const express = require('express');
const { errorHandler } = require('./middleware/index');
const cookieParser = require('cookie-parser')

const { PORT } = require('./config/server.config');
const apiRouter = require('./routes');

const app = express()

app.use((req, res, next) => {
      console.log(`[REQUEST] ${req.method} ${req.originalUrl}`)
      next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

app.use('/api', apiRouter);

app.use(errorHandler)

app.listen(PORT || 3000, () => {
      console.log(`Server running of port : ${PORT}`)
})