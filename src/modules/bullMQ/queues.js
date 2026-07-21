const { Queue } = require('bullmq')

const connection = {
      host: "localhost",
      port: 6379
}

const standingsQueue = new Queue('standings', { connection })
const mailQueue = new Queue('mail', { connection })

module.exports = {
      standingsQueue,
      mailQueue,
      connection
}