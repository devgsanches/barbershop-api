import { Request, Response } from 'express'
import { prisma } from '../database/prisma'
import { endOfDay, startOfDay } from 'date-fns'

export class BookingController {
  async store(req: Request, res: Response) {
    try {
      const { barbershopServiceId, userId, date } = req.body

      // A data vem como ISO string do frontend, convertemos para Date
      const bookingDate = new Date(date)

      // Verifica se já existe agendamento no mesmo horário
      const existingBooking = await prisma.booking.findFirst({
        where: {
          barbershopServiceId,
          date: bookingDate,
        },
      })

      if (existingBooking) {
        return res.status(400).json({
          message: 'Horário ocupado, por favor, escolha outro.',
        })
      }

      // Cria o agendamento (salva em UTC)
      const booking = await prisma.booking.create({
        data: {
          barbershopServiceId,
          userId,
          date: bookingDate,
        },
        include: {
          barbershopService: true,
          user: true,
        },
      })

      return res.status(201).json(booking)
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      return res.status(500).json({
        message: 'Erro interno do servidor',
      })
    }
  }

  async show(req: Request, res: Response) {
    const { userId } = req.params

    const bookings = await prisma.booking.findMany({
      where: {
        userId: String(userId),
      },
      include: {
        barbershopService: true,
      },
    })

    return res.json(bookings)
  }

  async showBookingsByDate(req: Request, res: Response) {
    try {
      const { date, serviceId } = req.query

      if (!date || !serviceId) {
        const bookings = await prisma.booking.findMany()
        return res.json(bookings)
      }

      // A data vem como ISO string do frontend
      const selectedDate = new Date(String(date))
      const start = startOfDay(selectedDate)
      const end = endOfDay(selectedDate)

      const bookings = await prisma.booking.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
          barbershopServiceId: String(serviceId),
        },
      })

      return res.json(bookings)
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
      return res.status(500).json({
        message: 'Erro interno do servidor',
      })
    }
  }

  async remove(req: Request, res: Response) {
    const { id } = req.params

    const booking = await prisma.booking.delete({
      where: { id },
    })

    return res.json(booking)
  }
}
