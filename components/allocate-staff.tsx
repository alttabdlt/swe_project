'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
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
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Job {
  id: string
  date: string
  type: string
  brand: string
  location: string
  driverAssigned?: string
  driverAssignedName?: string
  driverAssignedEmail?: string
  technicianAssigned?: string
  technicianAssignedName?: string
  technicianAssignedEmail?: string
  allocatedTime?: number
  status: string
}

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
  brand: string
  availability: string[]
  workload: number
  preference: string
}

export default function AllocateStaff() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([])

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsQuery = query(collection(db, 'jobs'))
        const querySnapshot = await getDocs(jobsQuery)
        const jobsData = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const jobData = {
              id: docSnapshot.id,
              ...docSnapshot.data(),
            } as Job

            // Fetch driver name
            if (jobData.driverAssigned) {
              const driverDoc = await getDoc(
                doc(db, 'users', jobData.driverAssigned)
              )
              jobData.driverAssignedName = driverDoc.data()?.name
              jobData.driverAssignedEmail = driverDoc.data()?.email
            }

            // Fetch technician name
            if (jobData.technicianAssigned) {
              const technicianDoc = await getDoc(
                doc(db, 'users', jobData.technicianAssigned)
              )
              jobData.technicianAssignedName = technicianDoc.data()?.name
              jobData.technicianAssignedEmail = technicianDoc.data()?.email
            }

            return jobData
          })
        )
        setJobs(jobsData)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      }
    }

    const fetchStaff = async () => {
      try {
        const staffQuery = query(collection(db, 'users'))
        const querySnapshot = await getDocs(staffQuery)
        const staffData = querySnapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        })) as StaffMember[]
        setAvailableStaff(staffData)
      } catch (error) {
        console.error('Error fetching staff:', error)
      }
    }

    fetchJobs()
    fetchStaff()
  }, [])

  const handleAssignDriver = async (jobId: string, driverId: string) => {
    try {
      const driverDoc = await getDoc(doc(db, 'users', driverId))
      const driverData = driverDoc.data()
      const jobRef = doc(db, 'jobs', jobId)
      await updateDoc(jobRef, {
        driverAssigned: driverId,
        driverAssignedName: driverData?.name,
        driverAssignedEmail: driverData?.email,
      })

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                driverAssigned: driverId,
                driverAssignedName: driverData?.name,
                driverAssignedEmail: driverData?.email,
              }
            : job
        )
      )
    } catch (error) {
      console.error('Error assigning driver:', error)
    }
  }

  const handleAssignTechnician = async (jobId: string, technicianId: string) => {
    try {
      const technicianDoc = await getDoc(doc(db, 'users', technicianId))
      const technicianData = technicianDoc.data()
      const jobRef = doc(db, 'jobs', jobId)
      await updateDoc(jobRef, {
        technicianAssigned: technicianId,
        technicianAssignedName: technicianData?.name,
        technicianAssignedEmail: technicianData?.email,
      })

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                technicianAssigned: technicianId,
                technicianAssignedName: technicianData?.name,
                technicianAssignedEmail: technicianData?.email,
              }
            : job
        )
      )
    } catch (error) {
      console.error('Error assigning technician:', error)
    }
  }

  const handleMarkJobPending = async (jobId: string) => {
    try {
      const jobRef = doc(db, 'jobs', jobId)
      await updateDoc(jobRef, {
        status: 'Pending',
        allocatedTime: 4, // Adjust as needed
      })

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: 'Pending' } : job
        )
      )
    } catch (error) {
      console.error('Error updating job status:', error)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', jobId))
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId))
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  // Separate unassigned, pending, and confirmed jobs
  const unassignedJobs = jobs.filter(
    (job) => !job.driverAssigned || !job.technicianAssigned
  )
  const pendingJobs = jobs.filter((job) => job.status === 'Pending')
  const confirmedJobs = jobs.filter((job) => job.status === 'Confirmed')

  return (
    <div className="container mx-auto p-4">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Allocate Staff</h1>
        <Link href="/manager">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Unassigned Jobs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Unassigned Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assign Driver</TableHead>
                <TableHead>Assign Technician</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHead>
            <TableBody>
              {unassignedJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.date}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>{job.brand}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>
                    <Select
                      onValueChange={(value) => handleAssignDriver(job.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStaff
                          .filter((staff) => staff.role === 'driver')
                          .map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      onValueChange={(value) =>
                        handleAssignTechnician(job.id, value)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Technician" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStaff
                          .filter((staff) => staff.role === 'technician')
                          .map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      Delete
                    </Button>
                    {job.driverAssigned && job.technicianAssigned && (
                      <Button
                        variant="outline"
                        onClick={() => handleMarkJobPending(job.id)}
                        className="ml-2"
                      >
                        Mark as Pending
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Jobs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pending Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Allocated Time</TableHead>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.date}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>{job.brand}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.driverAssignedName}</TableCell>
                  <TableCell>{job.technicianAssignedName}</TableCell>
                  <TableCell>{job.allocatedTime} hours</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirmed Jobs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Confirmed Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Allocated Time</TableHead>
              </TableRow>
            </TableHead>
            <TableBody>
              {confirmedJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.date}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>{job.brand}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.driverAssignedName}</TableCell>
                  <TableCell>{job.technicianAssignedName}</TableCell>
                  <TableCell>{job.allocatedTime} hours</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Available Staff */}
      <Card>
        <CardHeader>
          <CardTitle>Available Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Workload</TableHead>
                <TableHead>Preference</TableHead>
              </TableRow>
            </TableHead>
            <TableBody>
              {availableStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>{staff.brand}</TableCell>
                  <TableCell>
                    {Array.isArray(staff.availability)
                      ? staff.availability.join(', ')
                      : 'Not specified'}
                  </TableCell>
                  <TableCell>{staff.workload} hours</TableCell>
                  <TableCell>{staff.preference}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}