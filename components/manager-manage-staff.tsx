'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from '@/components/ui/table'
import { Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface StaffMember {
  id: string
  name: string
  role: string
  brand: string
  availability: string[]
  workload: number
  preference: string
}

export default function ManagerManageStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStaffSchedule, setSelectedStaffSchedule] = useState<{
    [key: string]: string
  }>({})

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffQuery = query(collection(db, 'users'), where('role', '!=', 'manager'))
        const querySnapshot = await getDocs(staffQuery)
        const staffData = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data()
            const availability = await fetchStaffAvailability(docSnap.id)
            const workload = await calculateWorkload(docSnap.id)
            return {
              id: docSnap.id,
              name: data.name || 'Unknown',
              role: data.role || 'Unknown',
              brand: data.brand || 'Not specified',
              availability: availability ? availability.dates : [],
              workload: workload || 0,
              preference:
                availability ? availability.jobPreference : 'Not specified',
            } as StaffMember
          })
        )
        setStaff(staffData)
      } catch (error) {
        console.error('Error fetching staff data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStaff()
  }, [])

  const fetchStaffAvailability = async (staffId: string) => {
    try {
      // Check both 'staffAvailability' and 'technicianAvailability' collections
      const staffDocRef = doc(db, 'staffAvailability', staffId)
      const staffDocSnap = await getDoc(staffDocRef)
      if (staffDocSnap.exists()) {
        return staffDocSnap.data()
      }

      const techDocRef = doc(db, 'technicianAvailability', staffId)
      const techDocSnap = await getDoc(techDocRef)
      if (techDocSnap.exists()) {
        return techDocSnap.data()
      }

      return null
    } catch (error) {
      console.error('Error fetching staff availability:', error)
      return null
    }
  }

  const calculateWorkload = async (staffId: string) => {
    try {
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('driverAssigned', '==', staffId)
      )
      const techJobsQuery = query(
        collection(db, 'jobs'),
        where('technicianAssigned', '==', staffId)
      )

      const [driverJobsSnap, technicianJobsSnap] = await Promise.all([
        getDocs(jobsQuery),
        getDocs(techJobsQuery),
      ])

      let totalWorkload = 0

      driverJobsSnap.forEach((doc) => {
        const jobData = doc.data()
        totalWorkload += jobData.allocatedTime || 4
      })

      technicianJobsSnap.forEach((doc) => {
        const jobData = doc.data()
        totalWorkload += jobData.allocatedTime || 4
      })

      return totalWorkload
    } catch (error) {
      console.error('Error calculating workload:', error)
      return 0
    }
  }

  const fetchStaffSchedule = async (staffId: string) => {
    try {
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('driverAssigned', '==', staffId)
      )
      const techJobsQuery = query(
        collection(db, 'jobs'),
        where('technicianAssigned', '==', staffId)
      )

      const [driverJobsSnap, technicianJobsSnap] = await Promise.all([
        getDocs(jobsQuery),
        getDocs(techJobsQuery),
      ])

      const schedule: { [key: string]: string } = {}

      driverJobsSnap.docs.forEach((docSnap) => {
        const jobData = docSnap.data()
        schedule[jobData.date] = `${jobData.type} at ${jobData.location} (Driver)`
      })

      technicianJobsSnap.docs.forEach((docSnap) => {
        const jobData = docSnap.data()
        schedule[jobData.date] = `${
          jobData.type
        } at ${jobData.location} (Technician)`
      })

      // Sort the schedule by date
      const sortedSchedule = Object.entries(schedule).sort(
        ([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()
      )

      setSelectedStaffSchedule(Object.fromEntries(sortedSchedule))
    } catch (error) {
      console.error('Error fetching staff schedule:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Staff</h1>
        <Link href="/manager">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Staff Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Workload</TableHead>
                <TableHead>Preference</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.brand}</TableCell>
                  <TableCell>
                    {Array.isArray(employee.availability)
                      ? employee.availability.join(', ')
                      : 'Not specified'}
                  </TableCell>
                  <TableCell>{employee.workload} hours</TableCell>
                  <TableCell>{employee.preference}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => fetchStaffSchedule(employee.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          View Schedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white">
                        <DialogHeader>
                          <DialogTitle>{employee.name}'s Schedule</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          {Object.entries(selectedStaffSchedule).map(
                            ([date, job]) => (
                              <p key={date}>
                                {date}: {job}
                              </p>
                            )
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
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