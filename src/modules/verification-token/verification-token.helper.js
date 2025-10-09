// Entities
import { VerificationTokenEntity } from 'src/modules/entities'

export const countVerificationTokens = async (options) => VerificationTokenEntity.count(options)

export const getAVerificationToken = async (options, transaction) =>
  VerificationTokenEntity.findOne({ ...options, transaction })

export const getVerificationTokens = async (options, transaction) =>
  VerificationTokenEntity.findAll({ ...options, transaction })
