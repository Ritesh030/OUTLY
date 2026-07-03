const executeInTransaction = async (sequelize, asyncFn) => {
      const transaction = await sequelize.transaction()

      try {
            const result = await asyncFn(transaction)
            await transaction.commit()
            return result
      } catch (error) {
            await transaction.rollback()
            throw error
      }
}

module.exports = {
      executeInTransaction
}
