const { StatusCodes } = require("http-status-codes")
const AppError = require("./AppError")

const validTransition = {
      'OPEN': ['REGISTRATION-CLOSED', 'CANCELLED'],
      'REGISTRATION-CLOSED': ['ONGOING', 'CANCELLED'],
      'ONGOING': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': []
}

const validateStatusTransition = (currentState, nextState) => {
      const availableTransition = validTransition[currentState]

      if (!availableTransition || !availableTransition.include(nextState)) {
            throw new AppError(
                  "Invalid Status Transition",
                  " ",
                  `Cannot change tournament status from ${currentStatus} to ${nextStatus}.`,
                  StatusCodes.BAD_REQUEST
            );
      }

      return true
}

module.exports = {
      validateStatusTransition
}