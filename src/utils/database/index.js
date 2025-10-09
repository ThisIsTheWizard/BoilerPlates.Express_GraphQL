import { Sequelize } from 'sequelize'

// Initiating Dot Env
require('dotenv').config()

// CustomError
import { CustomError } from 'src/utils/error'

export const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: 'postgres',
  // Please uncomment below lines for secured connection
  // dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: { acquire: 60000, idle: 10000, max: 100, min: 0 }
})

export const connectToPostgresDB = async () => {
  try {
    await sequelize.authenticate()

    console.log('Connection has been established successfully to database')
  } catch (error) {
    console.log('Unable to connect to the database, error:', error)
  }
}

export const useTransaction = async (callback) => {
  try {
    const innerCallback = async (transaction) => {
      const result = await callback(transaction).catch((err) => {
        // Catching database errors to ignore unhandled promise rejection
        throw new CustomError(err?.statusCode || 500, err?.message)
      })
      return result
    }

    return sequelize.transaction(innerCallback)
  } catch (err) {
    throw new CustomError(err?.statusCode || 500, err?.message)
  }
}
