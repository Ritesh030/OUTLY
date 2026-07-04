'use strict';

const bcrypt = require('bcrypt')

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.City, {
        foreignKey:'cityId',
        as:'city' // Alias to use when fetching data (e.g., user.city)
      })

      this.belongsToMany(models.Team, {
        through: 'UserTeam',
        foreignKey: 'userId',
        otherKey: 'teamId',
        as: 'teams'
      })

      this.belongsToMany(models.Tournament, {
        through: 'TournamentPlayers',
        foreignKey: 'userId',
        otherKey: 'tournamentId',
        as: 'tournaments'
      })

      this.hasMany(models.Team, {
        foreignKey: 'ownerId',
        as: 'ownedTeams'
      })
    }
  }
  User.init({
    name: {
      type:DataTypes.STRING,
    },
    email: {
      type:DataTypes.STRING,
      allowNull:false,
      unique:true
    },
    password: {
      type:DataTypes.STRING,
      allowNull:false,
    },
    cityId: {
      type:DataTypes.INTEGER,
      allowNull:true
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('USER', 'ORGANIZER', 'ADMIN'),
      defaultValue: 'USER',
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    underscored: false,
    hooks: {
      beforeCreate: async (user, options) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  return User;
};