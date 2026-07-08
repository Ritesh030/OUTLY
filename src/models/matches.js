'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Match extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      this.belongsTo(models.Tournament, {
        foreignKey: 'tournamentId',
        as: 'tournament'
      })

      this.hasOne(models.MatchResult, {
        foreignKey: 'matchId',
        as: 'result'
      });

    }
  }
  Match.init({
    tournamentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    roundNumber: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    teamAId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    teamBId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    scheduledAt: DataTypes.DATE,
    venue: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('SCHEDULED', 'ONGOING', 'COMPLETED', 'ABANDONED', 'POSTPONED'),
      defaultValue: 'SCHEDULED'
    }
  }, {
    sequelize,
    modelName: 'Match',
  });
  return Match;
};