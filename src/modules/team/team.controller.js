const { StatusCodes } = require("http-status-codes");
const { sendSuccessResponse } = require("../../utils");
const TeamService = require("./team.service");

const teamService = new TeamService()

const create = async (req, res, next) => {
      try {
            const { name } = req.body
            const ownerId = req.user.id

            const response = await teamService.create({ name, ownerId })

            return sendSuccessResponse(res, StatusCodes.CREATED, "Team created", response)
      } catch (error) {
            next(error)
      }
}

const addPlayer = async (req, res, next) => {
      try {
            const { teamId, playerId } = req.body
            const userId = req.user.id

            const response = await teamService.addPlayer({ userId, teamId, playerId })

            return sendSuccessResponse(res, StatusCodes.CREATED, "Player added", response)
      } catch (error) {
            next(error)
      }
}

const removePlayer = async (req, res, next) => {
      try {
            const { teamId, playerId } = req.body
            const userId = req.user.id

            const response = await teamService.removerPlayer({ userId, teamId, playerId })

            return sendSuccessResponse(res, StatusCodes.OK, "Player Deleted", response)
      } catch (error) {
            next(error)
      }
}

const assignCaptain = async (req, res, next) => {
      try {
            const { teamId, captainId } = req.body
            const userId = req.user.id

            const response = await teamService.assignCaptain({ userId, teamId, captainId })

            return sendSuccessResponse(res, StatusCodes.OK, "Captain assigned", response)
      } catch (error) {
            next(error)
      }
}

const getById = async (req, res, next) => {
      try {
            const { id } = req.params
            const team = await teamService.getById(id)

            return sendSuccessResponse(res, StatusCodes.OK, "Team fetched", team)
      } catch (error) {
            next(error)
      }
}

const getAll = async (req, res, next) => {
      try {
            const teams = await teamService.getAll()

            return sendSuccessResponse(res, StatusCodes.OK, "Teams fetched", teams)
      } catch (error) {
            next(error)
      }
}

module.exports = {
      create,
      addPlayer,
      removePlayer,
      assignCaptain,
      getAll,
      getById
}