import { Router, Request, Response } from 'express'
import passport from 'passport'
import { prisma } from '../database/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const authRouter = Router()

authRouter.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

authRouter.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login-failure' }),
  (req: Request, res: Response) => {
    // Verifica se req.user existe e tem as propriedades necessárias
    if (!req.user || !req.user.id || !req.user.email) {
      return res.redirect('http://localhost:3000/?error=auth_failed')
    }

    // Gera um token JWT para o usuário logado com Google
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET || 'segredo',
      { expiresIn: '1d' }
    )

    // Redireciona com o token como parâmetro
    res.redirect(`http://localhost:3000/?token=${token}`)
  }
)
authRouter.get('/login-failure', (req, res) => {
  res.status(401).json({ message: 'Falha na autenticação' })
})

authRouter.get('/profile', (req: Request, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.json(null)
  }

  // Verifica se o usuário tem as propriedades necessárias
  if (!req.user.id || !req.user.email) {
    return res.json(null)
  }

  // Adiciona o token JWT na resposta
  const token = jwt.sign(
    { id: req.user.id, email: req.user.email },
    process.env.JWT_SECRET || 'segredo',
    { expiresIn: '1d' }
  )

  res.json({
    ...req.user,
    token,
  })
})

authRouter.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err)
    res.status(200).json({ message: 'Logout realizado com sucesso' })
  })
})

// LOGIN
authRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return res.status(401).json({ message: 'Usuário não encontrado.' })
  }

  const isPasswordValid = await bcrypt.compare(password, String(user.password))

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Senha inválida.' })
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'segredo',
    { expiresIn: '1d' }
  )

  return res.json({
    message: 'Login realizado com sucesso',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
    },
  })
})

// REGISTER
authRouter.post('/auth/signup', async (req, res) => {
  const { email, password, name } = req.body

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: passwordHash,
      },
    })

    res.status(201).json({ user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro ao criar usuário.' })
  }
})
export { authRouter }
