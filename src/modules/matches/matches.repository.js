const db = require("../../models");
const { StatusCodes } = require("http-status-codes");
const CrudRepository = require("../crud/crud.repository");
const { buildAppError, AppError } = require("../../utils");
const { executeInTransaction } = require("../../utils/transactionHelper");
const { ballsToOvers } = require("../../utils/ballsToOverConversion");

class MatchesRepository extends CrudRepository {
      constructor() {
            super(db.Match) // all the curd funx are for match model
      }

      async getFixturesCount(tournamentId) {
            return await db.Match.count({
                  where: { tournamentId }
            })
      }

      async generateRoundRobin(tournamentId, teams, transaction) {
            const list = [...teams];
            if (list.length % 2 !== 0) {
                  list.push({ id: null, name: "BYE" });
            }

            const numTeams = list.length;
            const rounds = numTeams - 1;
            const matchesPerRound = numTeams / 2;

            const matchesToCreate = [];

            // 1. Generate the schedule in memory
            for (let round = 0; round < rounds; round++) {
                  for (let i = 0; i < matchesPerRound; i++) {
                        const home = list[i];
                        const away = list[numTeams - 1 - i];

                        if (home.teamId !== null && away.teamId !== null) {
                              matchesToCreate.push({
                                    tournamentId: tournamentId,
                                    roundNumber: round + 1,
                                    teamAId: home.teamId,
                                    teamBId: away.teamId,
                              });
                        }
                  }

                  // Rotate teams (Keep index 0 fixed, shift the rest)
                  list.splice(1, 0, list.pop());
            }

            // 2. Validate and execute DB Bulk Write
            try {
                  if (matchesToCreate.length === 0) {
                        throw new AppError(" ",
                              "Cannot generate a schedule: No valid participating teams found.", " ", StatusCodes.BAD_REQUEST);
                  }

                  const createdMatches = await db.Match.bulkCreate(matchesToCreate, { transaction });

                  return createdMatches;

            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - repository', controller: 'generateRoundRobin' })
            }
      }

      // only suports round-robin right now
      // In repository — generateFixtures
      async generateFixtures(tournamentId) {
            try {
                  return await executeInTransaction(db.sequelize, async (transaction) => {

                        // advisory lock only this operation — nothing else blocked
                        await db.sequelize.query(
                              `SELECT pg_advisory_xact_lock(:lockId)`,
                              { replacements: { lockId: tournamentId }, transaction }
                        )

                        // Re-check inside lock
                        const existingFixtures = await db.Match.count({
                              where: { tournamentId }, transaction
                        })
                        if (existingFixtures > 0) {
                              throw new AppError(
                                    "Fixtures Already Generated", " ",
                                    "Fixtures for this tournament have already been generated.",
                                    StatusCodes.CONFLICT
                              )
                        }

                        const teams = await db.TournamentTeams.findAll({
                              where: { tournamentId },
                              transaction,
                              lock: transaction.LOCK.UPDATE // since we do not want anyone to update teams in that tournament someone can still read the data
                        });

                        return await this.generateRoundRobin(tournamentId, teams, transaction)
                  })
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - repository', controller: 'generateFixtures' })
            }
      }

      async getActiveMatchesCount(tournamentId) {
            return await db.Match.count({
                  where: {
                        tournamentId,
                        status: ['ONGOING', 'COMPLETED']
                  }
            })
      }

      async recreateFixtures(tournamentId) {
            try {
                  return await executeInTransaction(db.sequelize, async (transaction) => {

                        // advisory lock only this operation — nothing else blocked
                        await db.sequelize.query(
                              `SELECT pg_advisory_xact_lock(:lockId)`,
                              { replacements: { lockId: tournamentId }, transaction }
                        )

                        // Re-check inside lock — guard against race condition
                        const activeMatches = await db.Match.count({
                              where: {
                                    tournamentId,
                                    status: ['ONGOING', 'COMPLETED']
                              },
                              transaction
                        })
                        if (activeMatches > 0) {
                              throw new AppError(
                                    "Matches In Progress", " ",
                                    "Cannot recreate fixtures — some matches are already ongoing or completed.",
                                    StatusCodes.BAD_REQUEST
                              )
                        }

                        // Delete existing fixtures
                        await db.Match.destroy({
                              where: { tournamentId },
                              transaction
                        })

                        const teams = await db.TournamentTeams.findAll({
                              where: { tournamentId },
                              transaction,
                              lock: transaction.LOCK.UPDATE // since we do not want anyone to update teams in that tournament someone can still read the data
                        });

                        // Regenerate
                        return await this.generateRoundRobin(tournamentId, teams, transaction)
                  })
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - repository', controller: 'recreateFixtures' })
            }
      }

      // for changing the match status (varified by state machine)
      async changeMatchStatus(match, newStatus) {
            try {
                  match.status = newStatus
                  await match.save()

                  return match
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - repository', controller: 'changeMatchStatus' })
            }
      }

      // getting the match result using matchId
      async getMatchResult(matchId) {
            try {
                  const result = await db.MatchResult.findOne({
                        where: { matchId }
                  })

                  return result
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - repository', controller: 'getMatchResult' })
            }
      }

      // create new match result
      async createMatchResult(data, transaction) {
            const run = async (t) => {
                  // Advisory lock — blocks concurrent creates for same match
                  await db.sequelize.query(
                        `SELECT pg_advisory_xact_lock(:lockId)`,
                        { replacements: { lockId: data.matchId }, transaction: t }
                  )

                  const existing = await this.getMatchResult(data.matchId)
                  if (existing) {
                        throw new AppError(
                              "Result Already Exists", " ",
                              "A result for this match already exists. Use update instead.",
                              StatusCodes.CONFLICT
                        )
                  }

                  return await db.MatchResult.create(data, { transaction: t })
            }

            try {
                  return transaction ? await run(transaction) : await executeInTransaction(db.sequelize, run)
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - repository', controller: 'createMatchResult' })
            }
      }

      // update match result
      async updateMatchResult(matchId, data, transaction) {
            const run = async (t) => {
                  // Advisory lock — blocks concurrent updates for same match
                  await db.sequelize.query(
                        `SELECT pg_advisory_xact_lock(:lockId)`,
                        { replacements: { lockId: matchId }, transaction: t }
                  )

                  const matchResult = await db.MatchResult.findOne({
                        where: { matchId },
                        lock: t.LOCK.UPDATE,
                        transaction: t
                  })
                  if (!matchResult) {
                        throw new AppError(
                              "Not Found", " ",
                              "No result found for this match. Use create instead.",
                              StatusCodes.NOT_FOUND
                        )
                  }

                  const previousWinnerId = matchResult.winnerTeamId
                  await matchResult.update(data, { transaction: t })

                  return { matchResult, previousWinnerId }
            }

            try {
                  return transaction ? await run(transaction) : await executeInTransaction(db.sequelize, run)
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - repository', controller: 'updateMatchResult' })
            }
      }

      // All points table logic and functions
      async getPointsTable(tournamentId) {
            try {
                  const [teams, matches] = await Promise.all([
                        this.getRegisteredTeams(tournamentId),
                        this.getCompletedMatches(tournamentId)
                  ])

                  const pointsMap = {}
                  teams.forEach(t => {
                        pointsMap[t.teamId] = {
                              teamId: t.teamId,
                              teamName: t.Team.name,
                              played: 0,
                              won: 0,
                              lost: 0,
                              tied: 0,
                              noResult: 0,
                              points: 0,
                              totalRunsScored: 0,
                              totalOversFaced: 0,
                              totalRunsConceded: 0,
                              totalOversBowled: 0
                        }
                  })

                  matches.forEach(match => {
                        const result = match.result
                        if (!result) return

                        const teamA = pointsMap[match.teamAId]
                        const teamB = pointsMap[match.teamBId]
                        if (!teamA || !teamB) return

                        if (result.resultType === 'NO_RESULT') {
                              teamA.noResult++
                              teamB.noResult++
                              teamA.points += 1
                              teamB.points += 1
                              return
                        }

                        teamA.played++
                        teamB.played++

                        const teamAOvers = ballsToOvers(result.teamABalls)
                        const teamBOvers = ballsToOvers(result.teamBBalls)

                        teamA.totalRunsScored += result.teamARuns
                        teamA.totalOversFaced += teamAOvers
                        teamA.totalRunsConceded += result.teamBRuns
                        teamA.totalOversBowled += teamBOvers

                        teamB.totalRunsScored += result.teamBRuns
                        teamB.totalOversFaced += teamBOvers
                        teamB.totalRunsConceded += result.teamARuns
                        teamB.totalOversBowled += teamAOvers

                        if (result.resultType === 'WIN') {
                              if (result.winnerTeamId === match.teamAId) {
                                    teamA.won++
                                    teamA.points += 2
                                    teamB.lost++
                              } else {
                                    teamB.won++
                                    teamB.points += 2
                                    teamA.lost++
                              }
                        } else if (result.resultType === 'TIE') {
                              teamA.tied++
                              teamB.tied++
                              teamA.points += 1
                              teamB.points += 1
                        }
                  })

                  return Object.values(pointsMap)
                        .map(team => {
                              const runRateScored = team.totalOversFaced > 0 ? team.totalRunsScored / team.totalOversFaced : 0
                              const runRateConceded = team.totalOversBowled > 0 ? team.totalRunsConceded / team.totalOversBowled : 0

                              return {
                                    teamId: team.teamId,
                                    teamName: team.teamName,
                                    played: team.played,
                                    won: team.won,
                                    lost: team.lost,
                                    tied: team.tied,
                                    noResult: team.noResult,
                                    points: team.points,
                                    nrr: parseFloat((runRateScored - runRateConceded).toFixed(3))
                              }
                        })
                        .sort((a, b) => b.points !== a.points ? b.points - a.points : b.nrr - a.nrr)

            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - repository', controller: 'getPointsTable' })
            }
      }

      async getRegisteredTeams(tournamentId) {
            try {
                  return await db.TournamentTeams.findAll({
                        where: { tournamentId },
                        include: [{
                              model: db.Team,
                              as: 'Team',
                              attributes: ['id', 'name']
                        }]
                  })
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - repository', controller: 'getRegisteredTeams' })
            }
      }

      async getCompletedMatches(tournamentId) {
            try {
                  return await db.Match.findAll({
                        where: { tournamentId, status: 'COMPLETED' },
                        include: [{
                              model: db.MatchResult,
                              as: 'result'
                        }]
                  })
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - repository', controller: 'getCompletedMatches' })
            }
      }
}

module.exports = MatchesRepository