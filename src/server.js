import express from "express"
import cors from "cors"
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"
import cookieParser from 'cookie-parser'

import institutionsRouter from "./services/institutions/index.js"
import usersRouter from "./services/users/index.js"

import { forbiddenHandler, notFoundErrorHandler, badRequestErrorHandler, catchAllErrorHandler, unAuthorizedHandler } from "./errorHandlers.js"

const server = express()

const port = process.env.PORT

// **************** MIDDLEWARES ****************

server.use(express.json())
server.use(cookieParser())

// ******** loggerMiddleware ************
const loggerMiddleware = (req, res, next) => {
  console.log(`Request method: ${req.method} ${req.url} -- ${new Date()}`)
  next()
}
server.use(loggerMiddleware)

// ******** cors ************
const whitelist = [process.env.FRONTEND_LOCAL_URL, process.env.FRONTEND_CLOUD_URL]
const corsOptions = {
  origin: function (origin, next) {
    console.log("ORIGIN ", origin)
    if (whitelist.indexOf(origin) !== -1) {
      // origin allowed
      next(null, true)
    } else {
      // origin not allowed
      next(new Error("CORS TROUBLES!!!!!"))
    }
  }, credentials: true
}
server.use(cors(corsOptions))


// ******** ROUTES ************

server.use("/institutions", institutionsRouter)
server.use("/users", usersRouter)

// ******** ERROR MIDDLEWARES ************

server.use(badRequestErrorHandler)
server.use(notFoundErrorHandler)
server.use(unAuthorizedHandler)
server.use(forbiddenHandler)
server.use(catchAllErrorHandler)

console.table(listEndpoints(server))

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(
    server.listen(port, () => {
      console.log("Server running on port", port)
    })
  )
  .catch(err => console.log("Mongo connection error ", err))