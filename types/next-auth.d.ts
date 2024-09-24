import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'

declare module "next-auth" {
  interface Session {
    user: {
      role: string
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User extends DefaultUser {
    id: string
    role: string
  }

  interface JWT {
    id: string
    role: string
  }
}