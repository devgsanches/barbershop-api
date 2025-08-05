import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { prisma } from '../database/prisma'
import passport from 'passport'

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3333/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findFirst({
          where: { googleId: profile.id },
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails?.[0].value || '',
              name: profile.displayName || '',
              imageUrl: profile.photos?.[0]?.value || null,
            },
          })
        }

        done(null, user)
      } catch (error) {
        done(error, undefined)
      }
    }
  )
)
