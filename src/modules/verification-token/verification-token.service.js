import { omit } from 'lodash'
import moment from 'moment-timezone'

// Entities
import { VerificationTokenEntity } from 'src/modules/entities'

// Helpers
import { commonHelper, userHelper, verificationTokenHelper } from 'src/modules/helpers'

// Services
import { notificationService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createAVerificationToken = async (data, options, transaction) =>
  VerificationTokenEntity.create(data, { ...options, transaction })

export const updateAVerificationToken = async (options, data, transaction) => {
  const verificationToken = await verificationTokenHelper.getAVerificationToken(options, transaction)
  if (!verificationToken?.id) {
    throw new CustomError(404, 'VERIFICATION_TOKEN_NOT_FOUND')
  }

  await verificationToken.update(data, { transaction })

  return verificationToken
}

export const updateVerificationTokens = async (options, data, transaction) =>
  VerificationTokenEntity.update(data, { ...options, transaction })

export const deleteAVerificationToken = async (options, transaction) => {
  const verificationToken = await verificationTokenHelper.getAVerificationToken(options, transaction)
  if (!verificationToken?.id) {
    throw new CustomError(404, 'VERIFICATION_TOKEN_NOT_FOUND')
  }

  await verificationToken.destroy({ transaction })

  return verificationToken
}

export const deleteVerificationTokens = async (options, transaction) =>
  VerificationTokenEntity.destroy({ ...options, transaction })

export const createAVerificationTokenForUser = async (params, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'first_name', required: false, type: 'string' },
      { field: 'last_name', required: false, type: 'string' },
      { field: 'type', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { email, first_name, last_name, type, user_id } = params || {}
  if (!['forgot_password', 'user_verification'].includes(type)) {
    throw new Error('TYPE_IS_INVALID')
  }

  const verificationToken = await createAVerificationToken(
    { email, token: commonHelper.getRandomNumber(6), type, user_id },
    null,
    transaction
  )
  if (!verificationToken?.id) {
    throw new Error('COULD_NOT_CREATE_VERIFICATION_TOKEN')
  }

  await notificationService.sendNotification({
    event: type === 'forgot_password' ? 'send_forgot_password_token' : 'send_user_verification_token',
    to_email: email,
    variables: {
      email,
      token: verificationToken?.token,
      url: process.env.WEB_URL || '',
      username: userHelper.getUsernameByNames(email, first_name, last_name)
    }
  })

  return verificationToken
}

export const validateVerificationTokenForUser = async (params = {}, transaction) => {
  commonHelper.validateRequiredProps(['token', 'type'], params)

  const { email, token, type, user_id } = params || {}
  if (!(email || user_id)) {
    throw new Error('MISSING_EMAIL_OR_USER_ID')
  }
  if (!['forgot_password', 'user_verification'].includes(type)) {
    throw new Error('TYPE_IS_INVALID')
  }

  const where = { status: 'unverified', token, type }

  if (email) where.email = email
  if (user_id) where.user_id = user_id

  const verificationToken = await verificationTokenHelper.getAVerificationToken({ where }, transaction)
  if (!verificationToken?.id) {
    throw new Error('OTP_IS_NOT_VALID')
  }
  if (moment(verificationToken?.expired_at).isBefore(moment())) {
    throw new Error('OTP_IS_EXPIRED')
  }

  await deleteVerificationTokens({ where: omit(where, ['token']) }, transaction)

  return verificationToken
}
