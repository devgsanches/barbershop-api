import { Router } from 'express'

import { BarbershopController } from '../controllers/barbershopController'

export const barbershopRouter = Router()
const barbershopController = new BarbershopController()

barbershopRouter.get('/', barbershopController.index)
barbershopRouter.get('/:id', barbershopController.show)
