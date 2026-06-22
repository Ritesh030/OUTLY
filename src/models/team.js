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
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Team',
  });
  return Team;
};