const { StatusCodes } = require("http-status-codes")
const AppError = require("./AppError")

const validTransitions = {
    'OPEN': ['REGISTRATION-CLOSED', 'CANCELLED'],
    'REGISTRATION-CLOSED': ['ONGOING', 'CANCELLED'],
    'ONGOING': ['COMPLETED', 'CANCELLED'],
    'COMPLETED': [],
    'CANCELLED': []
}

const validMatchTransitions = {
    'SCHEDULED': ['ONGOING', 'ABANDONED', 'POSTPONED'],
    'ONGOING': ['COMPLETED', 'ABANDONED'],
    'COMPLETED': [],
    'ABANDONED': [],
    'POSTPONED': []
}

const isValidStatusTransition = (currentState, nextState) => {
    const availableTransitions = validTransitions[currentState]

    if (!availableTransitions) {
        throw new AppError(
            "Invalid Status",
            " ",
            `'${currentState}' is not a valid tournament status.`,
            StatusCodes.BAD_REQUEST
        )
    }

    if (!availableTransitions.includes(nextState)) {
        throw new AppError(
            "Invalid Status Transition",
            " ",
            `Cannot change tournament status from '${currentState}' to '${nextState}'.`,
            StatusCodes.BAD_REQUEST
        )
    }

    return true
}

const isValidStatusTransitionForMatch = (currentState, nextState) => {
    const availableTransitions = validMatchTransitions[currentState]

    if(!availableTransitions) {
        throw new AppError(
            "Invalid Status",
            " ",
            `'${currentState}' is not a valid match status.`,
            StatusCodes.BAD_REQUEST
        )
    }

    if (!availableTransitions.includes(nextState)) {
        throw new AppError(
            "Invalid Status Transition",
            " ",
            `Cannot change match status from '${currentState}' to '${nextState}'.`,
            StatusCodes.BAD_REQUEST
        )
    }

    return true
}

module.exports = {
    isValidStatusTransition,
    isValidStatusTransitionForMatch
}