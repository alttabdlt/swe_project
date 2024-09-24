'use client'

import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import { useSession } from 'next-auth/react'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Job {
  id: string
  date: string
  type: string
  brand: string
  location: string
  status: string
}

export function StaffManageJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const { data: session } = useSession()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      if (!session?.user?.email) return

      try {
        const q = query(
          collection(db, 'users'),
          where('email', '==', session.user.email)
        )
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0]
          setCurrentUserId(userDoc.id)
        } else {
          console.error('No user found with email:', session.user.email)
        }
      } catch (error) {
        console.error('Error fetching user ID:', error)
      }
    }

    fetchCurrentUserId()
  }, [session])

  useEffect(() => {
    const fetchJobs = async () => {
      if (!currentUserId) return

      try {
        const q = query(
          collection(db, 'jobs'),
          where('driverAssigned', '==', currentUserId),
          where('status', 'in', ['Pending', 'Confirmed'])
        )
        const querySnapshot = await getDocs(q)
        const jobsData = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Job)
        )
        setJobs(jobsData)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      }
    }

    fetchJobs()
  }, [currentUserId])

  const handleAcceptJob = async (jobId: string) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        status: 'Confirmed',
        allocatedTime: 4, // Set the allocated time to 4 hours
      })
      setJobs((jobs) =>
        jobs.map((job) =>
          job.id === jobId ? { ...job, status: 'Confirmed', allocatedTime: 4 } : job
        )
      )
    } catch (error) {
      console.error('Error accepting job:', error)
    }
  }

  const handleRejectJob = async (jobId: string) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        driverAssigned: null,
        driverAssignedName: null,
        driverAssignedEmail: null,
        status: 'Unassigned',
      })
      setJobs((jobs) => jobs.filter((job) => job.id !== jobId))
    } catch (error) {
      console.error('Error rejecting job:', error)
    }
  }

  const handleCompleteJob = async (jobId: string) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        status: 'Completed',
      })
      setJobs((jobs) =>
        jobs.map((job) =>
          job.id === jobId ? { ...job, status: 'Completed' } : job
        )
      )
    } catch (error) {
      console.error('Error completing job:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Jobs</h1>
        <Link href="/staff">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.date}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>{job.brand}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.status}</TableCell>
                  <TableCell>
                    {job.status === 'Pending' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleAcceptJob(job.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRejectJob(job.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {job.status === 'Confirmed' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline">Complete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you sure you want to mark this job as
                              completed?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. Please ensure all
                              work has been finished before proceeding.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCompleteJob(job.id)}
                            >
                              Complete Job
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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