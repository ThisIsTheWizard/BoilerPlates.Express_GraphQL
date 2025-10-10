import { size } from 'lodash'

// Initiating Dot Env
require('dotenv').config()

// Helpers
import { userHelper } from 'src/modules/helpers'

// Services
import { authService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const validateTokenAndGetAuthUser = async (token = '') => {
  const { payload } = (await authService.verifyTokenForUser({ token, type: 'access_token' })) || {}
  if (!size(payload)) {
    throw new CustomError(401, 'INVALID_TOKEN')
  }
  if (!payload['user_id']) {
    throw new CustomError(401, 'UNAUTHORIZED')
  }

  return userHelper.getAuthUserWithRolesAndPermissions({
    roles: payload['roles'],
    user_id: payload['user_id']
  })
}

export const authorizer = async (req, res, next) => {
  try {
    const token = req.headers?.authorization || ''
    if (token) {
      req.user = await validateTokenAndGetAuthUser(token)
    } else {
      req.user = {}
    }

    return next()
  } catch {
    return next()
  }
}
