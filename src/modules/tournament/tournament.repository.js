const CrudRepository = require("../crud/crud.repository");
const db = require("../../models");

class TournamentRepository extends CrudRepository {
      constructor() {
            super(db.Tournament)
            this.model = db.Tournament
      }
}

module.exports = TournamentRepository