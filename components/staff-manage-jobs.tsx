'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ArrowLeft } from "lucide-react"
import Link from 'next/link'

interface Job {
  id: string;
  date: string;
  type: string;
  brand: string;
  location: string;
  status: string;
}

export function StaffManageJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const { data: session } = useSession()

  useEffect(() => {
    const fetchJobs = async () => {
      if (!session?.user?.email) return

      try {
        const q = query(collection(db, 'jobs'), where('assignedTo', '==', session.user.email))
        const querySnapshot = await getDocs(q)
        const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job))
        setJobs(jobsData)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      }
    }

    fetchJobs()
  }, [session])

  const handleRejectJob = async (jobId: string) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        status: 'Rejected',
        assignedTo: null
      })
      setJobs(jobs.filter(job => job.id !== jobId))
    } catch (error) {
      console.error('Error rejecting job:', error)
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
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.date}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>{job.brand}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.status}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Reject</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure you want to reject this job?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You will be warned to discuss this job with your manager before proceeding with the rejection.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRejectJob(job.id)}>Reject Job</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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