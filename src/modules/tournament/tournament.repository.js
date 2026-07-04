const CrudRepository = require("../crud/crud.repository");
const db = require("../../models");
const { executeInTransaction } = require("../../utils/transactionHelper");
const { AppError, buildAppError } = require("../../utils");
const { StatusCodes } = require("http-status-codes");

class TournamentRepository extends CrudRepository {
      constructor() {
            super(db.Tournament)
      }

      async getTeamsCount(tournamentId, transaction = null) {
            const count = await db.TournamentTeams.count({
                  where: { tournamentId: tournamentId }, transaction
            })

            return count
      }

      async getTournament(tournamentId, transaction = null) {
            try {
                  const tournament = await db.Tournament.findByPk(tournamentId, {
                        attributes: ['id', 'name', 'formate', 'status', 'maxTeams', 'playerPerTeam', 'registrationDeadline', 'startDate', 'location'],

                        include: [{
                              model: db.Team,
                              as: 'teams',
                              attributes: ['id', 'name'],
                              through: { attributes: [] }, // Hides TournamentTeams metadata from JSON output

                              include: [{
                                    model: db.User,
                                    as: 'member',
                                    attributes: ['id', 'name', 'email'],
                                    through: { attributes: ['role'] }
                              }]
                        }], transaction
                  })

                  return tournament
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw new Error(`Failed to fetch tournament tree: ${error.message}`)
            }
      }

      async getAll() {
            try {
                  const tournaments = await db.Tournament.findAll({
                        attributes: ['id', 'name', 'formate', 'status', 'maxTeams', 'playerPerTeam', 'registrationDeadline', 'startDate', 'location'],
                        include: [{
                              model: db.Team,
                              as: 'teams',
                              attributes: ['id', 'name'],
                              through: { attributes: [] },
                              include: [{
                                    model: db.User,
                                    as: 'member',
                                    attributes: ['id', 'name', 'email'],
                                    through: { attributes: ['role'] }
                              }]
                        }]
                  })

                  return tournaments
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'tournament - repository', controller: 'getAll' })
            }
      }

      async registerTeam({ tournamentId, teamId }) {
            try {
                  return await executeInTransaction(db.sequelize, async (transaction) => {

                        // 1. Validate tournament exists
                        const tournament = await db.Tournament.findByPk(tournamentId, { transaction })
                        if (!tournament) {
                              throw new AppError("Not Found", " ", "Tournament with this id does not exist.", StatusCodes.NOT_FOUND)
                        }

                        // 2. Check tournament status
                        if (tournament.status !== 'OPEN') {
                              throw new AppError("Registration Not Open", " ", "This tournament is not accepting registrations.", StatusCodes.BAD_REQUEST)
                        }

                        // 3. Check registration deadline
                        if (new Date() > new Date(tournament.registrationDeadline)) {
                              throw new AppError("Deadline Passed", " ", "The registration deadline has passed.", StatusCodes.BAD_REQUEST)
                        }

                        // 4. Check capacity
                        const numberOfRegisteredTeams = await this.getTeamsCount(tournamentId, transaction)
                        if (numberOfRegisteredTeams >= tournament.maxTeams) {
                              throw new AppError("Tournament Full", " ", "Maximum team capacity has been reached.", StatusCodes.BAD_REQUEST)
                        }

                        // 5. Validate team exists
                        const team = await db.Team.findByPk(teamId, { transaction })
                        if (!team) {
                              throw new AppError("Not Found", " ", "Team with this id does not exist.", StatusCodes.NOT_FOUND)
                        }

                        // 6. Check duplicate registration
                        const alreadyRegistered = await db.TournamentTeams.findOne({
                              where: { tournamentId, teamId }, transaction
                        })
                        if (alreadyRegistered) {
                              throw new AppError("Already Registered", " ", "This team is already registered.", StatusCodes.BAD_REQUEST)
                        }

                        // 7. Validate player count BEFORE adding
                        const playersInTeam = await team.getMember({ transaction })
                        if (playersInTeam.length !== tournament.playerPerTeam) {
                              throw new AppError(
                                    "Team Size Mismatch", " ",
                                    `Team must have exactly ${tournament.playerPerTeam} players to register.`,
                                    StatusCodes.BAD_REQUEST
                              )
                        }

                        // 8. Register team and players
                        await tournament.addTeams(team, { transaction })

                        // Manually insert each player with teamId included
                        await Promise.all(
                              playersInTeam.map(player =>
                                    db.TournamentPlayers.create({
                                          tournamentId: tournament.id,
                                          teamId: team.id,
                                          userId: player.id
                                    }, { transaction })
                              )
                        )

                        return await this.getTournament(tournamentId, transaction)
                  })
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'tournament - repository', controller: 'registerTeam' })
            }
      }
}

module.exports = TournamentRepository