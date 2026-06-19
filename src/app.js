const express = require('express');
const {errorHandler} = require('./middleware/index');

const {PORT} = require('./config/server.config')

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

// app.use('/api', apiRouter);

app.use(errorHandler)

app.listen(PORT || 3000, () => {
      console.log(`Server running of port : ${PORT}`)
})