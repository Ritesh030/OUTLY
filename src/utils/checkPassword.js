const bcrypt = require('bcrypt')

async function verifyUserPassword(givePassword, storedPassword) {
      try {
            return await bcrypt.compare(givePassword, storedPassword)
      } catch (error) {
            if(error instanceof AppError) throw error
            throw buildAppError(error, {service:utils, controller:verifyUserPassword})
      }
}

module.exports = verifyUserPassword