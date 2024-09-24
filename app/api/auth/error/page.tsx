'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthError() {
  const router = useRouter()

  useEffect(() => {
    router.push('/login?error=AuthError')
  }, [router])

  return <p>Authentication error. Redirecting...</p>
}