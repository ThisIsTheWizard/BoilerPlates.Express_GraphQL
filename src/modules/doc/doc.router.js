import { Router } from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express.js with PostgreSQL API',
      version: '1.0.0',
      description: 'A simple Express.js API application with PostgreSQL database.'
    },
    servers: [{ url: 'http://localhost:8000' }],
    components: { securitySchemes: { tokenAuth: { in: 'header', name: 'Authorization', type: 'apiKey' } } }
  },
  apis: ['./src/modules/**/*.router.js', './src/modules/doc/doc.schema.js']
})

export const docRouter = Router()

docRouter.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
