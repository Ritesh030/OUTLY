const CrudService = require("../crud/curd.service");
const TeamRepository = require("./team.repository");

class TeamService extends CrudService {
      constructor() {
            const repository = new TeamRepository()
            super(repository)
            this.repository = repository
      }
}

module.exports = TeamService