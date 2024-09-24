'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'

export function LoginPageComponent() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      console.log('Attempting to sign in...')
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })
      console.log('Sign in result:', result)

      if (result?.error) {
        setError('Invalid email or password')
        console.error('Sign in error:', result.error)
      } else if (result?.ok) {
        console.log('Sign in successful, fetching user data...')
        try {
          const userResponse = await fetch('/api/user', {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          })
          if (!userResponse.ok) {
            throw new Error(`HTTP error! status: ${userResponse.status}`)
          }
          const userData = await userResponse.json()
          console.log('User data:', userData)

          if (!userData || !userData.id) {
            throw new Error('User data is incomplete')
          }

          // Redirect based on user role
          switch (userData.role) {
            case 'manager':
              router.push('/manager')
              break
            case 'technician':
              router.push('/technician')
              break
            case 'driver':
              router.push('/staff')
              break
            default:
              throw new Error(`Unknown user role: ${userData.role}`)
          }
        } catch (fetchError: unknown) {
          console.error('Error fetching user data:', fetchError)
          setError(`Error fetching user data: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`)
        }
      }
    } catch (error: unknown) {
      console.error('Login error:', error)
      setError(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login to Aircon Retailer</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">Log In</Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/signup" className="text-sm text-blue-600 hover:underline">
              Don't have an account? Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}