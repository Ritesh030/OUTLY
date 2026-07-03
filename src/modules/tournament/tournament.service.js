const CrudService = require("../crud/curd.service");
const TournamentRepository = require("./tournament.repository");

class TournamentService extends CrudService {
      constructor() {
            const repository = new TournamentRepository()
            super(repository)
      }
}

module.exports = TournamentService