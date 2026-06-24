const { StatusCodes } = require("http-status-codes");
const { sendSuccessResponse } = require("../../utils");
const TeamService = require("./team.service");

const teamService = new TeamService()

const create = async (req, res, next) => {
      try {
            const {name} = req.body
            const ownerId = req.user.id

            const response = await teamService.create({name, ownerId})

            return sendSuccessResponse(res, StatusCodes.CREATED, "Team created", response)
      } catch (error) {
            next(error)
      }
}

module.exports = {
      create
}