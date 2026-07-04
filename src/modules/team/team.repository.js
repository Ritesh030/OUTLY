const CrudRepository = require("../crud/crud.repository");
const { Team, User, UserTeam, sequelize } = require("../../models/index");
const { AppError, buildAppError } = require("../../utils");
const UserRepository = require("../user/user.repository");
const { StatusCodes } = require("http-status-codes");
const { executeInTransaction } = require("../../utils/transactionHelper");

class TeamRepository extends CrudRepository {
      constructor() {
            super(Team)
            this.model = Team
            this.userRepository = new UserRepository()
      }

      async addPlayer({ userId, teamId, playerId }) {
            try {
                  return await executeInTransaction(sequelize, async (transaction) => {
                        const team = await super.getById(teamId)
                        if (!team) {
                              throw new AppError("Team not found", " ", "Team with this teamId does not exists", StatusCodes.BAD_REQUEST);
                        }

                        if (team.ownerId != userId) {
                              throw new AppError("user is not the owner", " ", "User cannot add the member as it is not the owner", StatusCodes.UNAUTHORIZED);
                        }

                        const player = await this.userRepository.getById(playerId)

                        if (!player) {
                              throw new AppError("Player not found", " ", "Player does not exitsts to add in the team", StatusCodes.BAD_REQUEST);
                        }

                        await team.addMember(player, { transaction })

                        const response = await this.model.findByPk(teamId, {
                              include: [{ model: User, as: 'member', attributes: ['id', 'email'], through: { attributes: ['role'] } }],
                              transaction
                        })

                        return response
                  })
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'team - repository', controller: 'addPlayer' })
            }
      }

      async removePlayer({ userId, teamId, playerId }) {
            try {
                  return await executeInTransaction(sequelize, async (transaction) => {
                        const team = await super.getById(teamId)

                        if (!team) {
                              throw new AppError("Team not found", " ", "Team with this teamId does not exists", StatusCodes.BAD_REQUEST);
                        }

                        if (team.ownerId != userId) {
                              throw new AppError("user is not the owner", " ", "User cannot remove the player as they are not the owner", StatusCodes.UNAUTHORIZED);
                        }

                        const player = await this.userRepository.getById(playerId)

                        if (!player) {
                              throw new AppError("Player not found", " ", "Player does not exitsts to remove from the team", StatusCodes.BAD_REQUEST);
                        }

                        await team.removeMember(player, { transaction })

                        const response = await this.model.findByPk(teamId, {
                              include: [{ model: User, as: 'member', attributes: ['id', 'email'], through: { attributes: ['role'] } }],
                              transaction
                        })

                        return response
                  })
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'team - repository', controller: 'removePlayer' })
            }
      }

      async assignCaptain({ userId, teamId, captainId }) {
            try {
                  return await executeInTransaction(sequelize, async (transaction) => {
                        const team = await super.getById(teamId)

                        if (!team) {
                              throw new AppError("Team not found", " ", "Team with this teamId does not exists", StatusCodes.BAD_REQUEST);
                        }

                        if (team.ownerId != userId) {
                              throw new AppError("Unauthorized", " ", "Only the team owner can change the captain", StatusCodes.UNAUTHORIZED);
                        }

                        await UserTeam.update(
                              { role: 'PLAYER' },
                              {
                                    where: { teamId: teamId, role: 'CAPTAIN' },
                                    transaction
                              }
                        )

                        const [updatedRows] = await UserTeam.update(
                              { role: 'CAPTAIN' },
                              {
                                    where: { teamId: teamId, userId: captainId },
                                    transaction
                              }
                        )

                        if (updatedRows === 0) {
                              throw new AppError("Invalid Operation", " ", "The designated user must be a member of the team to become captain", StatusCodes.BAD_REQUEST);
                        }

                        const response = await this.model.findByPk(teamId, {
                              include: [{ model: User, as: 'member', attributes: ['id', 'email'], through: { attributes: ['role'] } }],
                              transaction
                        })

                        return response
                  })
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'team - repository', controller: 'assignCaptain' })
            }
      }

      async getById(id) {
            try {
                  const team = await this.model.findByPk(id, {
                        include: [{ model: User, as: 'member', attributes: ['id', 'name', 'email'], through: { attributes: ['role'] } }]
                  })

                  if (!team) {
                        throw new AppError("Team not found", " ", "Team with this id does not exist", StatusCodes.NOT_FOUND);
                  }

                  return team
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'team - repository', controller: 'getById' })
            }
      }

      async getAll() {
            try {
                  const teams = await this.model.findAll({
                        include: [{ model: User, as: 'member', attributes: ['id', 'name', 'email'], through: { attributes: ['role'] } }]
                  })

                  return teams
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'team - repository', controller: 'getAll' })
            }
      }
}

module.exports = TeamRepository