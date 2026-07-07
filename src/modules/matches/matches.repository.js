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

                  const createdMatches = await db.Match.bulkCreate(matchesToCreate, {transaction});
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
}

module.exports = MatchesRepository