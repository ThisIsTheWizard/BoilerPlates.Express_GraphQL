import { intersection, size } from 'lodash'

// Initiating Dot Env
require('dotenv').config()

// Helpers
import { userHelper } from 'src/modules/helpers'

// Services
import { userService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const validateTokenAndGetAuthUser = async (token = '') => {
  const { payload } = (await userService.verifyTokenForUser({ token, type: 'access_token' })) || {}
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

export const authorizer = (requiredRoles = ['admin', 'developer', 'moderator', 'user']) => {
  const callback = async (req, res, next) => {
    try {
      const token = req.headers?.authorization || ''
      if (!token) {
        throw new Error('MISSING_TOKEN')
      }

      req.user = await validateTokenAndGetAuthUser(token)

      if (requiredRoles.length && !size(intersection(requiredRoles, req.user?.roles))) {
        throw new Error('MISSING_REQUIRED_ROLES')
      }

      return next()
    } catch (err) {
      err.statusCode = 401
      next(err)
    }
  }

  return callback
}
