declare global {
  namespace Express {
    interface User {
      id: string
      name: string
      email: string
      imageUrl?: string | null
      token?: string
    }
  }
}

export {}
