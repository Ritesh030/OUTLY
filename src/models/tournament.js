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
      
      this.hasMany(models.Match, {
        foreignKey: 'tournamentId',
        as: 'Matches'
      })

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
      type: DataTypes.ENUM('OPEN', 'REGISTRATION-CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED'),
      defaultValue: 'OPEN'
    },
    maxTeams: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [2],
          msg: "A tournament must allow minimum 2 teams"
        }
      }
    },
    playerPerTeam: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [13],
          msg: "Team must contain at least 13 players"
        },
        max: {
          args: [15],
          msg: "A team can have maximum of 15 players"
        }
      }
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
    underscored: false
  });
  return Tournament;
};