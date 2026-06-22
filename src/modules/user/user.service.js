const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const CrudService = require('../crud/curd.service');
const UserRepository = require('./user.repository');
const { AppError } = require('../../utils');
const { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY } = require('../../config/server.config');
const verifyUserPassword = require('../../utils/checkPassword');

function generateAccessToken(data) {
      return jwt.sign(data, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken(data) {
      return jwt.sign(data, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

class UserService extends CrudService {
      constructor() {
            const repository = new UserRepository();
            super(repository);
            this.repository = repository;
      }

      async login({ email, password }) {
            const user = await this.repository.getByEmail(email);

            if (!user) {
                  throw new AppError("login error", "User not found at user service", "Invalid email or password", StatusCodes.UNAUTHORIZED);
            }

            const isPasswordCorrect = await verifyUserPassword(password, user.password);

            if (!isPasswordCorrect) {
                  throw new AppError("login error", "Password mismatch at user service", "Invalid email or password", StatusCodes.UNAUTHORIZED);
            }

            const tokenPayload = { id: user.id, email: user.email };
            const accessToken = generateAccessToken(tokenPayload);
            const refreshToken = generateRefreshToken(tokenPayload);

            const isUpdated = await this.repository.update(user.id, { refreshToken });

            if (!isUpdated) {
                  console.log(`cannot set the refresh token for the user with id: ${user.id}`);
                  throw new AppError("DatabaseError", "Token update failed", "Could not secure your login session", StatusCodes.INTERNAL_SERVER_ERROR);
            }

            const sanitizedUser = user.toJSON ? user.toJSON() : { ...user };
            delete sanitizedUser.password;

            return { user: sanitizedUser, accessToken, refreshToken };
      }
}

module.exports = UserService;