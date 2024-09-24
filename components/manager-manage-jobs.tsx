'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Job {
  id: string
  date: string
  type: string
  brand: string
  location: string
  driverAssigned?: string
  driverAssignedName?: string
  technicianAssigned?: string
  technicianAssignedName?: string
  status: string
}

interface User {
  id: string
  name: string
  role: string
}

export default function ManagerManageJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newJob, setNewJob] = useState<Omit<Job, 'id' | 'status' | 'driverAssigned' | 'technicianAssigned' | 'driverAssignedName' | 'technicianAssignedName'>>({
    date: '',
    type: '',
    brand: '',
    location: '',
  })

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsQuery = collection(db, 'jobs')
        const querySnapshot = await getDocs(jobsQuery)
        const jobsData = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const jobData = { id: docSnapshot.id, ...docSnapshot.data() } as Job

            if (jobData.driverAssigned) {
              const driverDocRef = doc(db, 'users', jobData.driverAssigned)
              const driverDocSnap = await getDoc(driverDocRef)
              if (driverDocSnap.exists()) {
                jobData.driverAssignedName = driverDocSnap.data().name || 'Unknown'
              }
            }

            if (jobData.technicianAssigned) {
              const technicianDocRef = doc(db, 'users', jobData.technicianAssigned)
              const technicianDocSnap = await getDoc(technicianDocRef)
              if (technicianDocSnap.exists()) {
                jobData.technicianAssignedName = technicianDocSnap.data().name || 'Unknown'
              }
            }

            return jobData
          })
        )
        setJobs(jobsData)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()

    const unsubscribe = onSnapshot(collection(db, 'jobs'), () => {
      fetchJobs()
    })

    return () => unsubscribe()
  }, [])

  const handleCreateJob = async () => {
    try {
      await addDoc(collection(db, 'jobs'), {
        ...newJob,
        status: 'Unassigned',
      })
      setNewJob({
        date: '',
        type: '',
        brand: '',
        location: '',
      })
    } catch (error) {
      console.error('Error creating job:', error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Jobs</h1>
        <Link href="/manager">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Job</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newJob.date}
                onChange={(e) => setNewJob({ ...newJob, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                onValueChange={(value) => setNewJob({ ...newJob, type: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Installation">Installation</SelectItem>
                  <SelectItem value="Servicing">Servicing</SelectItem>
                  <SelectItem value="Installation and Servicing">Installation and Servicing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Select
                onValueChange={(value) => setNewJob({ ...newJob, brand: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dicon">Dicon</SelectItem>
                  <SelectItem value="M Electric">M Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newJob.location}
                onChange={(e) =>
                  setNewJob({ ...newJob, location: e.target.value })
                }
              />
            </div>
            <Button onClick={handleCreateJob}>Create Job</Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Driver Assigned</TableHead>
                <TableHead>Technician Assigned</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.date}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>{job.brand}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.driverAssignedName || 'Unassigned'}</TableCell>
                  <TableCell>
                    {job.technicianAssignedName || 'Unassigned'}
                  </TableCell>
                  <TableCell>{job.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}