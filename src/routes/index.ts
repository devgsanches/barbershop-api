import { Router } from 'express'
import { barbershopRouter } from './barbershopRoutes'
import { authRouter } from './authRoutes'
import { bookingRouter } from './bookingRoutes'
const routes = Router()

routes.use('/barbershop', barbershopRouter)
routes.use('/booking', bookingRouter)
routes.use(authRouter)

export { routes }
