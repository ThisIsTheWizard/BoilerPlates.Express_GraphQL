import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils'
import { defaultFieldResolver } from 'graphql'
import { includes, intersection, size } from 'lodash'

// Utils
import { CustomError } from 'src/utils/error'

export function authDirective(directiveName = 'auth') {
  return {
    authDirectiveTransformer: (schema) =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0]
          if (authDirective) {
            const { permission, roles } = authDirective
            const { resolve = defaultFieldResolver } = fieldConfig

            fieldConfig.resolve = async function (source, args, context) {
              if (includes(roles || [], 'public')) {
                return resolve(source, args, context)
              }

              // Check if user is authenticated
              const { user } = context || {}
              if (!user?.id) {
                throw new CustomError(401, 'UNAUTHORIZED')
              }

              // Check role requirements
              if (!size(intersection(roles || [], user?.role_names || []))) {
                throw new CustomError(401, 'UNAUTHORIZED')
              }
              // Check permission requirements
              if (permission && !includes(user?.permissions || [], permission)) {
                throw new CustomError(403, 'PERMISSION_DENIED')
              }

              return resolve(source, args, context)
            }
          }
          return fieldConfig
        }
      })
  }
}
