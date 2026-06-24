const CrudRepository = require("../crud/crud.repository");
const { Team, User } = require("../../models/index"); 
const { AppError, buildAppError } = require("../../utils");
const UserRepository = require("../user/user.repository");
const { StatusCodes } = require("http-status-codes");

class TeamRepository extends CrudRepository {
      constructor() {
            super(Team)
            this.model = Team
            this.userRepository = new UserRepository()
      }

      async addPlayer({userId, teamId, playerId}) {
            try {
                  const team = await super.getById(teamId)
                  if(!team) {
                        throw new AppError("Team not found", " ", "Team with this teamId does not exists", StatusCodes.BAD_REQUEST);
                  }

                  if(team.ownerId != userId) {
                        throw new AppError("user is not the owner", " ", "User cannot add the member as it is not the owner", StatusCodes.UNAUTHORIZED);
                  }
                  
                  const player = await this.userRepository.getById(playerId)

                  if(!player) {
                        throw new AppError("Player not found", " ", "Player does not exitsts to add in the team", StatusCodes.BAD_REQUEST);
                  }

                  await team.addMember(player)

                  const response = await this.model.findByPk(teamId, {
                        include: [{ model: User, as: 'member', attributes: ['id', 'email'] }]
                  })

                  return response
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service:'team - repository', controller: 'addPlayer' })
            }
      }

      async removePlayer({userId, teamId, playerId}) {
            try {
                  const team = await super.getById(teamId)

                  if(!team) {
                        throw new AppError("Team not found", " ", "Team with this teamId does not exists", StatusCodes.BAD_REQUEST);
                  }

                  if(team.ownerId != userId) {
                        throw new AppError("user is not the owner", " ", "User cannot remove the player as they are not the owner", StatusCodes.UNAUTHORIZED);
                  }
                  
                  const player = await this.userRepository.getById(playerId)

                  if(!player) {
                        throw new AppError("Player not found", " ", "Player does not exitsts to remove from the team", StatusCodes.BAD_REQUEST);
                  }

                  await team.removeMember(player)

                  const response = await this.model.findByPk(teamId, {
                        include: [{ model: User, as: 'member', attributes: ['id', 'email'] }]
                  })

                  return response
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'team - repository', controller: 'removePlayer' })
            }
      }
}

module.exports = TeamRepository