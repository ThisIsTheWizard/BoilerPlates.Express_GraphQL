import { expressMiddleware } from '@as-integrations/express4'
import { Router } from 'express'

// Initiating dotenv
require('dotenv').config()

// GraphQL
import { GQLServer } from 'src/graphql/server'

// Middlewares
import { authorizer } from 'src/middlewares/authorizer'

// Utils
import { getLatestVerificationTokenForTesting, startDBSetupForTesting } from 'src/utils/seed'

const router = Router()

// GraphQL Route
GQLServer.start()
  .then(() => {
    console.log('+++ GraphQL Server Started Successfully +++')

    router.use(
      '/graphql',
      authorizer(),
      expressMiddleware(GQLServer, { context: ({ req }) => ({ token: req.headers.authorization, user: req.user }) })
    )
  })
  .catch((err) => {
    console.log('+++ Something went wrong when starting GraphQL server, error:', err, '+++')
  })

// Test
router.post('/test/setup', startDBSetupForTesting)
router.get('/test/verification-tokens', getLatestVerificationTokenForTesting)

export default router
