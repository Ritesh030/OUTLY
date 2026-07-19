const { Queue } = require('bullmq')

const connection = {
      host: "localhost",
      port: 6379
}

const standingsQueue = new Queue('standings', { connection })

module.exports = {
      standingsQueue,
      connection
}