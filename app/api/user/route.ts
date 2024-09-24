import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  console.log('API /user - session:', session)

  if (session && session.user) {
    return NextResponse.json({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    })
  } else {
    console.log('API /user - No session found')
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }
}