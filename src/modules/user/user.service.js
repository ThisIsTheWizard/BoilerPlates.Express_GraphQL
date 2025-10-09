import { map, omit, pick, size, slice } from 'lodash'
import moment from 'moment-timezone'
import { Op } from 'sequelize'

// Entities
import { UserEntity } from 'src/modules/entities'

// Helpers
import { commonHelper, userHelper, verificationTokenHelper } from 'src/modules/helpers'

// Services
import { authTokenService, commonService, roleUserService, verificationTokenService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createAUser = async (data, options, transaction) => UserEntity.create(data, { ...options, transaction })

export const updateAUser = async (options, data, transaction) => {
  const user = await UserEntity.findOne({ ...options, transaction })
  if (!user?.id) {
    throw new CustomError(404, 'USER_NOT_FOUND')
  }

  await user.update(data, { transaction })

  return user
}

export const deleteAUser = async (options, transaction) => {
  const user = await UserEntity.findOne({ ...options, transaction })
  if (!user?.id) {
    throw new CustomError(404, 'USER_NOT_FOUND')
  }

  await user.destroy({ transaction })

  return user
}

export const registerUser = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'first_name', required: true, type: 'string' },
      { field: 'last_name', required: true, type: 'string' },
      { field: 'password', required: true, type: 'string' }
    ],
    params
  )

  const { email, first_name, last_name, password } = params || {}
  if (!commonHelper.validatePassword(password)) {
    throw new Error('PASSWORD_DID_NOT_CONFORM_OUR_POLICY')
  }

  const existingUser = await userHelper.getAUser({ where: { email } }, transaction)
  if (existingUser?.id) {
    throw new Error('EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
  }

  const user = await createAUser(
    { email, first_name, last_name, password: commonService.generateHashPassword(password) },
    null,
    transaction
  )
  if (!user?.id) {
    throw new Error('COULD_NOT_CREATE_USER')
  }

  await roleUserService.assignARoleToUserByName({ role_name: 'user', user_id: user?.id }, transaction)

  await verificationTokenService.createAVerificationTokenForUser(
    { ...pick(user, ['email', 'first_name', 'last_name']), type: 'user_verification', user_id: user?.id },
    transaction
  )

  return omit(user?.dataValues, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const verifyUserEmail = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'token', required: true, type: 'string' }
    ],
    params
  )

  const { email, token } = params || {}

  await verificationTokenService.validateVerificationTokenForUser(
    { email, token, type: 'user_verification' },
    transaction
  )

  const user = await userHelper.getAUser({ where: { email } }, transaction)
  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST')
  }

  await user.update({ status: 'active' }, { transaction })

  return omit(user?.dataValues, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const resendUserVerificationEmail = async (params = {}, transaction) => {
  commonHelper.validateProps([{ field: 'email', required: true, type: 'string' }], params)

  const { email } = params || {}
  const user = await userHelper.getAUser({ where: { [Op.or]: [{ email }, { new_email: email }] } }, transaction)
  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST')
  }
  if (!(user?.status === 'unverified') && !user?.new_email) {
    throw new Error('USER_IS_ALREADY_VERIFIED')
  }

  const existingTokens = await verificationTokenHelper.getVerificationTokens(
    {
      order: [['created_at', 'desc']],
      where: {
        created_at: { [Op.gte]: moment().subtract(10, 'minutes').toDate() },
        status: { [Op.in]: ['cancelled', 'unverified'] },
        type: 'user_verification',
        user_id: user?.id
      }
    },
    transaction
  )
  if (size(existingTokens) >= 3) {
    throw new Error('TOO_MANY_RESEND_VERIFICATION_REQUESTS')
  }

  await verificationTokenService.updateVerificationTokens(
    { where: { status: 'unverified', type: 'user_verification', user_id: user?.id } },
    { status: 'cancelled' },
    transaction
  )

  await verificationTokenService.createAVerificationTokenForUser(
    { ...pick(user, ['email', 'first_name', 'last_name']), type: 'user_verification', user_id: user?.id },
    transaction
  )

  return omit(user?.dataValues, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const loginUser = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'password', required: true, type: 'string' }
    ],
    params
  )

  const { email, password } = params || {}
  const user = await userHelper.getAUser({ include: [{ association: 'roles' }], where: { email } }, transaction)
  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }
  if (!commonService.compareHashPassword(password, user?.password)) {
    throw new Error('PASSWORD_IS_INCORRECT')
  }

  return authTokenService.createAuthTokensForUser({ roles: map(user?.roles, 'name'), user_id: user?.id }, transaction)
}

export const logoutAUser = async (params, transaction) => authTokenService.revokeAnAuthTokenForUser(params, transaction)

export const verifyTokenForUser = async (params, transaction) =>
  authTokenService.verifyAnAuthTokenForUser(params, transaction)

export const refreshTokensForUser = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'access_token', required: true, type: 'string' },
      { field: 'refresh_token', required: true, type: 'string' }
    ],
    params
  )

  const { access_token, refresh_token } = params || {}
  const { roles, user_id } = commonService.decodeJWTToken(access_token) || {}

  const user = await userHelper.getAuthUserWithRolesAndPermissions({ roles, user_id })

  return authTokenService.refreshAuthTokensForUser({ refresh_token, roles: user?.roles, user_id }, transaction)
}

export const changeEmailByUser = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'new_email', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { new_email, user_id } = params || {}

  if (!commonHelper.validateEmail(new_email)) {
    throw new Error('EMAIL_IS_INVALID')
  }

  const existingUser = await userHelper.getAUser(
    { where: { [Op.or]: [{ email: new_email }, { new_email }] } },
    transaction
  )
  if (existingUser?.id) {
    throw new Error('NEW_EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
  }

  const user = await userHelper.getAUser({ where: { id: user_id } }, transaction)
  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }

  await user.update({ new_email }, { transaction })

  await verificationTokenService.deleteVerificationTokens(
    {
      where: {
        email: new_email,
        status: { [Op.in]: ['cancelled', 'unverified'] },
        type: 'user_verification',
        user_id
      }
    },
    transaction
  )

  await verificationTokenService.createAVerificationTokenForUser(
    { ...pick(user, ['first_name', 'last_name']), email: new_email, type: 'user_verification', user_id },
    transaction
  )

  return omit(user?.dataValues, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const cancelChangeEmailByUser = async (params, transaction) => {
  commonHelper.validateProps([{ field: 'email', required: true, type: 'string' }], params)

  const { email } = params || {}

  const user = await userHelper.getAUser({ where: { new_email: email } }, transaction)
  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }

  await user.update({ new_email: null }, { transaction })

  const deletedTokens = await verificationTokenService.deleteVerificationTokens(
    {
      where: {
        email,
        status: { [Op.in]: ['cancelled', 'unverified'] },
        type: 'user_verification',
        user_id: user?.id
      }
    },
    transaction
  )
  if (deletedTokens <= 0) {
    throw new Error('NO_CHANGE_EMAIL_REQUEST_IS_FOUND')
  }

  return omit(user?.dataValues, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const verifyChangeEmailByUser = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'token', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { token, user_id } = params || {}

  await verificationTokenService.validateVerificationTokenForUser(
    { token, type: 'user_verification', user_id },
    transaction
  )

  const user = await userHelper.getAUser({ where: { id: user_id } }, transaction)
  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }

  await user.update({ email: user?.new_email, new_email: null }, { transaction })

  return omit(user?.dataValues, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const setUserEmailByAdmin = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'new_email', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { new_email, user_id } = params || {}

  const existingUser = await userHelper.getAUser(
    { where: { [Op.or]: [{ email: new_email }, { new_email }] } },
    transaction
  )
  if (existingUser?.id) {
    throw new Error('NEW_EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
  }

  const user = await userHelper.getAUser({ where: { id: user_id } }, transaction)
  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST')
  }

  await user.update({ email: new_email, new_email: null }, { transaction })

  return omit(user?.dataValues, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const changePasswordByUser = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'new_password', required: true, type: 'string' },
      { field: 'old_password', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { new_password, old_password, user_id } = params || {}

  if (new_password === old_password) {
    throw new Error('NEW_PASSWORD_IS_SAME_AS_OLD_PASSWORD')
  }

  const user = await userHelper.getAUser({ where: { id: user_id } }, transaction)
  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }
  if (!commonHelper.validatePassword(new_password)) {
    throw new Error('PASSWORD_DID_NOT_CONFORM_OUR_POLICY')
  }
  // Check for old passwords
  if (!commonService.compareHashPassword(old_password, user?.password)) {
    throw new Error('OLD_PASSWORD_IS_INCORRECT')
  }
  if (commonService.checkOldPasswords(new_password, user?.old_passwords)) {
    throw new Error('PASSWORD_IS_ALREADY_USED_BEFORE')
  }

  const password = commonService.generateHashPassword(new_password)
  const updatingData = { old_passwords: [...slice(user.old_passwords, 1, 3), password], password }

  await user.update(updatingData, { transaction })

  await authTokenService.deleteAuthTokens({ where: { user_id } }, transaction)

  return omit(user?.dataValues, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const changePasswordByAdmin = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'password', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { password, user_id } = params || {}

  const user = await userHelper.getAUser({ where: { id: user_id } }, transaction)
  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST')
  }

  const hashPassword = commonService.generateHashPassword(password)

  await user.update(
    { old_passwords: [...slice(user?.old_passwords, 1, 3), hashPassword], password: hashPassword },
    { transaction }
  )

  await authTokenService.deleteAuthTokens({ where: { user_id } }, transaction)

  return omit(user?.dataValues, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const forgotPassword = async (params = {}, transaction) => {
  commonHelper.validateProps([{ field: 'email', required: true, type: 'string' }], params)

  const { email } = params || {}

  const user = await userHelper.getAUser({ where: { email } }, transaction)
  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST')
  }

  const existingTokens = await verificationTokenHelper.getVerificationTokens(
    {
      order: [['created_at', 'desc']],
      where: {
        created_at: { [Op.gte]: moment().subtract(10, 'minutes').toDate() },
        email,
        status: { [Op.in]: ['cancelled', 'unverified'] },
        type: 'forgot_password',
        user_id: user?.id
      }
    },
    transaction
  )
  if (size(existingTokens) >= 3) {
    throw new Error('TOO_MANY_FORGOT_PASSWORD_REQUESTS')
  }

  await verificationTokenService.updateVerificationTokens(
    { where: { email, status: 'unverified', type: 'forgot_password', user_id: user?.id } },
    { status: 'cancelled' },
    transaction
  )
  await verificationTokenService.createAVerificationTokenForUser(
    { ...pick(user, ['first_name', 'last_name']), email, type: 'forgot_password', user_id: user?.id },
    transaction
  )

  return omit(user?.dataValues, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const retryForgotPassword = async (params = {}, transaction) => {
  commonHelper.validateProps([{ field: 'email', required: true, type: 'string' }], params)

  const { email } = params || {}

  const user = await userHelper.getAUser({ where: { email } }, transaction)
  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST')
  }

  const existingTokens = await verificationTokenHelper.getVerificationTokens(
    {
      order: [['created_at', 'desc']],
      where: {
        created_at: { [Op.gte]: moment().subtract(10, 'minutes').toDate() },
        email,
        status: { [Op.in]: ['cancelled', 'unverified'] },
        type: 'forgot_password',
        user_id: user?.id
      }
    },
    transaction
  )
  if (size(existingTokens) >= 3) {
    throw new Error('TOO_MANY_FORGOT_PASSWORD_REQUESTS')
  }

  await verificationTokenService.updateVerificationTokens(
    { where: { email, status: 'unverified', type: 'forgot_password', user_id: user?.id } },
    { status: 'cancelled' },
    transaction
  )
  await verificationTokenService.createAVerificationTokenForUser(
    { ...pick(user, ['first_name', 'last_name']), email, type: 'forgot_password', user_id: user?.id },
    transaction
  )

  return omit(user?.dataValues, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const verifyForgotPasswordCode = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'token', required: true, type: 'string' }
    ],
    params
  )

  const { email, token } = params || {}
  const verificationToken = await verificationTokenHelper.getAVerificationToken(
    { where: { email, status: 'unverified', token, type: 'forgot_password' } },
    transaction
  )
  if (!verificationToken?.id) {
    throw new Error('OTP_IS_NOT_VALID')
  }
  if (moment(verificationToken?.expired_at).isBefore(moment())) {
    throw new Error('OTP_IS_EXPIRED')
  }

  return { message: 'OTP_IS_VALID', success: true }
}

export const verifyForgotPassword = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'password', required: true, type: 'string' },
      { field: 'token', required: true, type: 'string' }
    ],
    params
  )

  const { email, password, token } = params || {}

  await verificationTokenService.validateVerificationTokenForUser(
    { email, token, type: 'forgot_password' },
    transaction
  )

  const user = await userHelper.getAUser({ where: { email } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!commonHelper.validatePassword(password)) {
    throw new Error('PASSWORD_DID_NOT_CONFORM_OUR_POLICY')
  }
  // Check for old passwords
  if (commonService.compareHashPassword(password, user?.password)) {
    throw new Error('PASSWORD_IS_ALREADY_USED_BEFORE')
  }
  if (commonService.checkOldPasswords(password, user?.old_passwords)) {
    throw new Error('PASSWORD_IS_ALREADY_USED_BEFORE')
  }

  const hashPassword = commonService.generateHashPassword(password)

  await user.update(
    { old_passwords: [...slice(user?.old_passwords, 1, 3), hashPassword], password: hashPassword },
    { transaction }
  )

  await authTokenService.deleteAuthTokens({ where: { user_id: user?.id } }, transaction)

  return omit(user?.dataValues, ['created_at', 'new_email', 'old_passwords', 'password', 'updated_at'])
}

export const verifyUserPassword = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'password', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { password, user_id } = params || {}

  const user = await userHelper.getAUser({ where: { id: user_id } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error(`USER_IS_${user?.status?.toUpperCase?.()}`)
  }
  if (!commonService.compareHashPassword(password, user?.password)) {
    return { message: 'PASSWORD_IS_INCORRECT', success: false }
  }

  return { message: 'PASSWORD_IS_CORRECT', success: true }
}
