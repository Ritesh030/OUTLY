const CrudRepository = require("../crud/crud.repository");
const {Team} = require("../../models/index")

class TeamRepository extends CrudRepository {
      constructor() {
            super(Team)
            this.model = Team
      }
}

module.exports = TeamRepository