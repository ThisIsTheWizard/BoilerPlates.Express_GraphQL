import { ApolloServer } from '@apollo/server'
import { unwrapResolverError } from '@apollo/server/errors'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { size } from 'lodash'

// Initiating dotenv
require('dotenv').config()

// GraphQL
import { authDirective } from 'src/graphql/directives/auth'
import resolvers from 'src/graphql/resolvers'
import typeDefs from 'src/graphql/schema'

const { authDirectiveTransformer } = authDirective()
const schema = authDirectiveTransformer(makeExecutableSchema({ resolvers, typeDefs }))

// Apollo Server
export const GQLServer = new ApolloServer({
  introspection: process.env.NODE_ENV !== 'production',
  plugins: [
    {
      async requestDidStart() {
        return {
          async didEncounterErrors(ctx) {
            for (const err of ctx.errors) {
              const originalError = unwrapResolverError(err)
              const exception = typeof originalError === 'object' ? originalError : null

              if (size(exception)) {
                err.message = exception.message || err?.message || 'INTERNAL SERVER ERROR'
                // Intentionally avoid setting HTTP status to keep GraphQL responses at 200
              }
            }
          }
        }
      }
    }
  ],
  schema
})
