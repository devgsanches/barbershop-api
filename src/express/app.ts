import express from 'express'
import { routes } from '../routes'
import cors from 'cors'
import session from 'express-session'
import passport from 'passport'
import '../passport'

const app = express()

app.use(
  cors({
    origin: 'http://localhost:3000', // ajuste para o domínio do seu front
    credentials: true,
  })
)

app.use(express.json())

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret', // use variável ambiente no seu projeto real
    resave: false,
    saveUninitialized: false,
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use(routes)

export { app }
