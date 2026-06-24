const { AppError, buildAppError } = require("../../utils");
const CrudService = require("../crud/curd.service");
const TeamRepository = require("./team.repository");
const { StatusCodes } = require("http-status-codes");

class TeamService extends CrudService {
      constructor() {
            const repository = new TeamRepository()
            super(repository)
            this.repository = repository
      }

      async addPlayer({userId, teamId, playerId}) {
            try {
                  const response = this.repository.addPlayer({userId, teamId, playerId})
                  return response
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'team - service', controller: 'addPlayer' })
            }
      }

      async removerPlayer({userId, teamId, playerId}) {
            try {
                  const response = this.repository.removePlayer({userId, teamId, playerId})
                  return response
            } catch (error) {
                  if(error instanceof AppError) throw error
                  throw buildAppError(error, {service: 'team - service', controller: 'removePlayer'})
            }
      }
}

module.exports = TeamService