import { Request, Response } from 'express'
import { prisma } from '../database/prisma'

export class BarbershopController {
  async index(request: Request, response: Response) {
    const { search, service } = request.query

    if (search || service) {
      const barbershops = await prisma.barbershop.findMany({
        where: {
          OR: [
            search
              ? {
                  name: {
                    contains: search as string,
                    mode: 'insensitive',
                  },
                }
              : {},
            service
              ? {
                  services: {
                    some: {
                      name: {
                        contains: service as string,
                        mode: 'insensitive',
                      },
                    },
                  },
                }
              : {},
          ],
        },
      })
      return response.json(barbershops)
    }

    const barbershops = await prisma.barbershop.findMany()
    return response.json(barbershops)
  }

  async show(request: Request, response: Response) {
    const { id } = request.params
    const barbershop = await prisma.barbershop.findUnique({
      where: { id },
      include: {
        services: true,
      },
    })
    return response.json(barbershop)
  }
}

export default new BarbershopController()
