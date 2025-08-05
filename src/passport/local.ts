import { Strategy as LocalStrategy } from 'passport-local'
import { prisma } from '../database/prisma'
import bcrypt from 'bcrypt'
import passport from 'passport'

passport.use(
  new LocalStrategy(
    { usernameField: 'email' }, // diz que o campo será 'email'
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user || !user.password) {
          return done(null, false, { message: 'Usuário não encontrado' })
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
          return done(null, false, { message: 'Senha incorreta' })
        }

        return done(null, user)
      } catch (err) {
        return done(err)
      }
    }
  )
)
