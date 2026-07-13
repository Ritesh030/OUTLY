'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.belongsToMany(models.User, {
        through: 'UserTeam',
        foreignKey: 'teamId',
        otherKey: 'userId',
        as: 'member' // Allows you to run team.getMembers()
      })

      this.belongsToMany(models.Tournament, {
        through: 'TournamentTeams',
        foreignKey: 'teamId',
        otherKey: 'tournamentId',
        as: 'tournaments'
      })

      this.belongsTo(models.User, {
        foreignKey: 'ownerId',
        as: 'owner'
      })
    }
  }
  Team.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      require: true
    },
    totalWins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: "totalWins cannot be less that 0"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Team',
    underscored: false
  });
  return Team;
};