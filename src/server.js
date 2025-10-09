import cors from 'cors'
import express from 'express'
import http from 'http'

// Initiating dotenv
require('dotenv').config()

// Middlewares
import { error } from 'src/middlewares'

// Routes
import routes from 'src/routes'

// Utils
import { connectToPostgresDB } from 'src/utils/database'

// Express Application
const app = express()

// Using CORS for cross site origin issue
app.use(cors({ origin: '*' }))
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Allow-Methods', '*')

  next()
})

// Body Parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Welcome to Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome To Express.js API Server' })
})

// API Routes
app.use(routes)

// WildCard Route
app.use((req, res) => {
  res.status(404).json({ message: 'NotFound' })
})

// Middleware For Handling Errors
app.use(error)

// Server
const server = http.createServer(app)

connectToPostgresDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`====> Server is started on ${process.env.PORT || 8000} <=====`)
    })
  })
  .catch((err) => {
    console.log('+++ Something went wrong when restarting server, error:', err, '+++')
  })

export default server
