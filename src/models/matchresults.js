'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MatchResult extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MatchResult.init({
    matchId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    winnerTeamId: DataTypes.INTEGER,
    teamARuns: DataTypes.INTEGER,
    teamAOvers: DataTypes.INTEGER,
    teamAWickets: DataTypes.INTEGER,
    teamBRuns: DataTypes.INTEGER,
    teamBOvers: DataTypes.INTEGER,
    teamBWickets: DataTypes.INTEGER,
    resultType: {
      type: DataTypes.ENUM('WIN', 'TIE', 'NO_RESULT'),
      allowNull: false
    },
    note: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'MatchResult',
  });
  return MatchResult;
};