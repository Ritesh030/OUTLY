const { AppError, buildAppError } = require("../../utils")

class CrudRepository {
      constructor(model) {
            this.model = model
      }

      async create(data) {
            try {
                  const response = await this.model.create(data)
                  return response
            } catch (error) {
                  if(error instanceof AppError) throw error
                  throw buildAppError(error, {service:'crud-repository', controller:'create'})
            }
      }

      async getById(id) {
            try {
                  const response = await this.model.findByPk(id)
                  return response
            } catch (error) {
                  if(error instanceof AppError) throw error
                  throw buildAppError(error, {service:'crud-repository', controller:'get'})
            }
      }

      async getAll() {
            try {
                  const response = await this.model.findAll()
                  return response
            } catch (error) {
                  if(error instanceof AppError) throw error
                  throw buildAppError(error, {service:'crud-repository', controller:'getAll'})
            }
      }

      async update(id, data) {
            try {
                  const response = await this.model.update(data, {
                        where: {
                              id:id
                        }
                  })
                  return response > 0
            } catch (error) {
                  if(error instanceof AppError) throw error
                  throw buildAppError(error, {service:'crud-repository', controller:'update'})
            }
      }

      async destroy(id) {
            try {
                  const response = await this.model.destroy({
                        where: {
                              id:id
                        }
                  })

                  return response > 0
            } catch (error) {
                  if(error instanceof AppError) throw error
                  throw buildAppError(error, {service:'crud-repository', controller:'update'})
            }
      }
}

module.exports = CrudRepository