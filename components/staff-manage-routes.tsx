'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Route {
  id: string;
  date: string;
  startLocation: string;
  endLocation: string;
  assignments: string[];
}

export function StaffManageRoutes() {
  const [routes, setRoutes] = useState<Route[]>([])
  const { data: session } = useSession()

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!session?.user?.email) return

      try {
        const q = query(
          collection(db, 'routes'),
          where('assignedTo', '==', session.user.email),
          where('date', '>=', new Date().toISOString().split('T')[0])
        )
        const querySnapshot = await getDocs(q)
        const routesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Route))
        setRoutes(routesData)
      } catch (error) {
        console.error('Error fetching routes:', error)
      }
    }

    fetchRoutes()
  }, [session])

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Routes</h1>
        <Link href="/staff">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Weekly Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Start Location</TableHead>
                <TableHead>End Location</TableHead>
                <TableHead>Assignments</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>{route.date}</TableCell>
                  <TableCell>{route.startLocation}</TableCell>
                  <TableCell>{route.endLocation}</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {route.assignments.map((assignment, idx) => (
                        <li key={idx}>{assignment}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <MapPin className="mr-2 h-4 w-4" />
                      View Map
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}