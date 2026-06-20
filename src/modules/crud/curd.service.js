class CrudService {
      constructor(repository) {
            this.repository = repository
      }

      async create(data) {
            try {
                  const response = await this.repository.create(data)
                  return response
            } catch (error) {
                  if(error instanceof AppError) throw error
                  throw new buildAppError(error, {service:crud-service, controller:create})
            }
      }

      async get(id) {
            try {
                  const response = await this.repository.get(id)
                  return response
            } catch (error) {
                  if(error instanceof AppError) throw error
                  throw new buildAppError(error, {service:crud-service, controller:get})
            }
      }

      async getAll() {
            try {
                  const response = await this.repository.getAll()
                  return response
            } catch (error) {
                  if(error instanceof AppError) throw error
                  throw new buildAppError(error, {service:crud-service, controller:getall})
            }
      }

      async update(id, data) {
            try {
                  const response = await this.repository.update(id, data)
                  return response
            } catch (error) {
                  if(error instanceof AppError) throw error
                  throw new buildAppError(error, {service:crud-service, controller:update})
            }
      }

      async destroy(id) {
            try {
                  const response = await this.repository.destroy(id)
                  return response
            } catch (error) {
                  if(error instanceof AppError) throw error
                  throw new buildAppError(error, {service:crud-service, controller:destroy})
            }
      }
}

module.exports = CrudService