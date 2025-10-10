import { intersection, size } from 'lodash'

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

export const authorizer = (roles = []) => {
  const callback = async (req, res, next) => {
    // Skip auth for GraphiQL
    if (req.method === 'GET' && req.originalUrl === '/graphql') {
      return next()
    }
    // Skip auth for introspection queries
    if (req.body?.query?.includes('__schema') || req.body?.query?.includes('IntrospectionQuery')) {
      return next()
    }

    try {
      const token = req.headers?.authorization || ''
      if (!token) {
        throw new Error('MISSING_TOKEN')
      }

      req.user = await validateTokenAndGetAuthUser(token)

      if (size(roles) && !size(intersection(roles, req.user?.roles))) {
        throw new Error('UNAUTHORIZED')
      }

      return next()
    } catch (err) {
      err.statusCode = 401
      next(err)
    }
  }

  return callback
}
