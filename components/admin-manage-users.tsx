'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebaseConfig'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AdminManageUsers() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [brand, setBrand] = useState('')

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role,
        brand: role === 'technician' ? brand : null,
        createdAt: new Date().toISOString()
      })

      // Reset form
      setName('')
      setEmail('')
      setPassword('')
      setRole('')
      setBrand('')

      alert('User created successfully')
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Select value={role} onValueChange={setRole} required>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="technician">Technician</SelectItem>
              <SelectItem value="driver">Driver</SelectItem>
            </SelectContent>
          </Select>
          {role === 'technician' && (
            <Select value={brand} onValueChange={setBrand} required>
              <SelectTrigger>
                <SelectValue placeholder="Select brand certification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="m_electric">M Electric</SelectItem>
                <SelectItem value="dicon">Dicon</SelectItem>
                <SelectItem value="both">Both Brands</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button type="submit">Create User</Button>
        </form>
      </CardContent>
    </Card>
  )
}