'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tournament extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsToMany(models.Team, {
        through: 'TournamentTeams',
        foreignKey: 'tournamentId',
        otherKey: 'teamId',
        as: 'teams'
      })

      this.belongsToMany(models.User, {
        through: 'TournamentPlayers',
        foreignKey: 'tournamentId',
        otherKey: 'userId',
        as: 'players'
      })
    }
  }
  Tournament.init({
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    organizerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    formate: {
      type: DataTypes.ENUM('ROUND-ROBIN', 'KNOCKOUT', 'GROUP-STAGE'),
      defaultValue: 'ROUND-ROBIN'
    },
    status:{
      type: DataTypes.ENUM('DRAFT', 'OPEN', 'REGISTRATION-CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED'),
      defaultValue: 'DRAFT'

    },
    max_teams: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    registrationDeadline: {
      type: DataTypes.DATE,
      defaultValue: () => {
        const date = new Date();
        date.setDate(date.getDate() + 5);
        return date;
      }
    },
    startDate: {
      type: DataTypes.DATE,
      defaultValue: () => {
        const date = new Date();
        date.setDate(date.getDate() + 6);
        return date;
      }
    },
    location: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Tournament',
  });
  return Tournament;
};