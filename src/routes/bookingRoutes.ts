import { Router } from 'express'
import { BookingController } from '../controllers/bookingController'
import { authenticateToken } from '../middlewares/auth'

export const bookingRouter = Router()
const bookingController = new BookingController()

bookingRouter.post('/', authenticateToken, bookingController.store)
bookingRouter.get('/', authenticateToken, bookingController.showBookingsByDate)
bookingRouter.get('/:userId', authenticateToken, bookingController.show)
bookingRouter.delete('/:id', authenticateToken, bookingController.remove)
