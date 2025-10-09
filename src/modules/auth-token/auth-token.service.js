// Entities
import { AuthTokenEntity } from 'src/modules/entities'

// Helpers
import { authTokenHelper, commonHelper, userHelper } from 'src/modules/helpers'

// Services
import { commonService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createAnAuthToken = async (data, options, transaction) =>
  AuthTokenEntity.create(data, { ...options, transaction })

export const updateAnAuthToken = async (options, data, transaction) => {
  const authToken = await authTokenHelper.getAnAuthToken(options, transaction)
  if (!authToken?.id) {
    throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')
  }

  await authToken.update(data, { transaction })

  return authToken
}

export const deleteAnAuthToken = async (options, transaction) => {
  const authToken = await authTokenHelper.getAnAuthToken(options, transaction)
  if (!authToken?.id) {
    throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')
  }

  await authToken.destroy({ transaction })

  return authToken
}

export const deleteAuthTokens = async (options, transaction) => AuthTokenEntity.destroy({ ...options, transaction })

export const createAuthTokensForUser = async (params, transaction) => {
  commonHelper.validateRequiredProps(['roles', 'user_id'], params)

  const { roles, user_id } = params || {}

  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '1d'
  const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '30d'

  const access_token = commonService.generateJWTToken({ roles, sub: user_id, user_id }, accessTokenExpiry)
  const refresh_token = commonService.generateJWTToken({ sub: user_id, user_id }, refreshTokenExpiry)

  const authToken = await createAnAuthToken({ access_token, refresh_token, user_id }, null, transaction)
  if (!authToken?.id) {
    throw new Error('COULD_NOT_CREATE_AUTH_TOKEN')
  }

  return { access_token, refresh_token }
}

export const verifyAnAuthTokenForUser = async (params = {}) => {
  commonHelper.validateProps(
    [
      { field: 'token', required: true, type: 'string' },
      { field: 'type', required: true, type: 'string' }
    ],
    params
  )

  const { token, type } = params || {}
  if (!['access_token', 'refresh_token'].includes(type)) {
    throw new Error('TOKEN_TYPE_IS_INVALID')
  }

  const { user_id } = commonService.decodeJWTToken(token) || {}
  const authToken = await authTokenHelper.getAnAuthToken({
    where: { [type]: token, user_id }
  })
  if (!authToken?.id) {
    return { message: 'INVALID_TOKEN', success: false }
  }

  return commonService.verifyJWTToken(token) || {}
}

export const refreshAuthTokensForUser = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'refresh_token', required: true, type: 'string' },
      { field: 'roles', required: true, type: 'object' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { refresh_token, roles, user_id } = params || {}

  commonService.verifyJWTToken(refresh_token)

  const authToken = await authTokenHelper.getAnAuthToken(
    { include: [{ association: 'user' }], where: { refresh_token, user_id } },
    transaction
  )
  if (!authToken?.id) {
    throw new Error('REFRESH_TOKEN_IS_INVALID')
  }

  const { user } = authToken || {}
  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST')
  }
  if (!(user?.status === 'active')) {
    throw new Error('USER_IS_NOT_ACTIVE')
  }

  await authToken.destroy({ transaction })

  return createAuthTokensForUser({ roles, user_id }, transaction)
}

export const revokeAnAuthTokenForUser = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'token', required: true, type: 'string' },
      { field: 'type', required: true, type: 'string' }
    ],
    params
  )

  const { token, type } = params || {}
  if (!['access_token', 'refresh_token'].includes(type)) {
    throw new Error('TOKEN_TYPE_IS_INVALID')
  }

  const authToken = await deleteAnAuthToken({ where: { [type]: token } }, transaction)
  if (!authToken?.id) {
    return { message: 'INVALID_TOKEN', success: false }
  }

  return { message: 'LOGGED_OUT', success: true }
}

export const revokeAuthTokensForUser = async (params = {}, transaction) => {
  commonHelper.validateProps([{ field: 'user_id', required: true, type: 'string' }], params)

  const { user_id } = params || {}
  const user = await userHelper.getAUser({ where: { id: user_id } }, transaction)
  if (!user?.id) {
    throw new Error('USER_IS_NOT_FOUND')
  }
  if (!(user?.status === 'active')) {
    throw new Error('USER_IS_NOT_ACTIVE')
  }

  const deletedCount = await deleteAuthTokens({ where: { user_id } }, transaction)
  if (deletedCount <= 0) {
    return { message: 'INVALID_TOKEN', success: false }
  }

  return { message: 'LOGGED_OUT', success: true }
}
