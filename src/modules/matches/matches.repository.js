const { StatusCodes } = require("http-status-codes");
const db = require("../../models");
const CrudRepository = require("../crud/crud.repository");
const { buildAppError, AppError } = require("../../utils");
const { executeInTransaction } = require("../../utils/transactionHelper");

class MatchesRepository extends CrudRepository {
      constructor() {
            super(db.Match) // all the curd funx are for match model
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

      async generateFixtures(tournamentId) {
            try {
                  const teams = await db.TournamentTeams.findAll({
                        where: {
                              tournamentId: tournamentId
                        }
                  })

                  return await executeInTransaction(db.sequelize, async (transaction) => {
                        return await this.generateRoundRobin(tournamentId, teams, transaction)
                  })
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - repository', controller: 'generateFixtures' })
            }
      }

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

      async createMatchResult(data) {
            try {
                  const matchresult = await db.MatchResult.create(data)

                  return matchresult
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - repository', controller: 'createMatchResult' })
            }
      }

      async getPointsTable(tournamentId) {
            try {
                  // 1. Get all teams registered in this tournament
                  const teams = await db.TournamentTeams.findAll({
                        where: { tournamentId },
                        include: [{
                              model: db.Team,
                              as: 'Team',
                              attributes: ['id', 'name']
                        }]
                  })

                  // 2. Get all completed matches with their results
                  const matches = await db.Match.findAll({
                        where: {
                              tournamentId,
                              status: 'COMPLETED'
                        },
                        include: [{
                              model: db.MatchResult,
                              as: 'result'
                        }]
                  })

                  // 3. Build points map from registered teams
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
                              points: 0
                        }
                  })

                  // 4. Process each match result
                  matches.forEach(match => {
                        const result = match.result
                        if (!result) return  

                        const teamA = pointsMap[match.teamAId]
                        const teamB = pointsMap[match.teamBId]
                        if (!teamA || !teamB) return

                        teamA.played++
                        teamB.played++

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

                        } else if (result.resultType === 'NO_RESULT') {
                              teamA.noResult++
                              teamB.noResult++
                              teamA.points += 1  
                              teamB.points += 1
                        }
                  })

                  // 5. Sort by points descending
                  return Object.values(pointsMap).sort((a, b) => b.points - a.points)

            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - repository', controller: 'getPointsTable' })
            }
      }
}

module.exports = MatchesRepository