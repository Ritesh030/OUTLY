const { StatusCodes } = require('http-status-codes')
const { User } = require('../../models/index')
const { AppError } = require('../../utils')
const CrudRepository = require('../crud/crud.repository')
const verifyUserPassword = require('../../utils/checkPassword')

class UserRepository extends CrudRepository {
      constructor() {
            super(User)
            this.model = User
      }

      async getByEmail(email) {
            try {
                  const user = await this.model.findOne({
                        where: {
                              email: email
                        }
                  })

                  if (!user) {
                        throw new AppError("getByEmail", "User not found", "User with this email id not do exists", StatusCodes.NOT_FOUND)
                  }

                  return user
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'user - repository', controller: 'update' })
            }
      }

      async update(id, data) {
            try {
                  if (data.password) {
                        throw new AppError("PasswordUpdateError", "Password cannot be updated here", "Please use the specialized password reset endpoint", StatusCodes.BAD_REQUEST);
                  }

                  const response = await this.model.update(data, {
                        where: { id: id },
                        individualHooks: true
                  });

                  return response && response[0] > 0;
            } catch (error) {
                  if (error instanceof AppError) throw error;
                  throw new buildAppError(error, { service: 'user-repository', controller: 'update' });
            }
      }
}

module.exports = UserRepository