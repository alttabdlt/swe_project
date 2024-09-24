'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, addDoc, where, deleteDoc, doc, updateDoc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from '@/components/ui/table'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addMonths } from 'date-fns'

interface Job {
  id: string;
  date: string;
  type: string;
  brand: string;
  location: string;
  assignedTo?: string;
  assignedToName?: string;
  status: string;
}

export default function ManagerManageJobsComponent() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [newJob, setNewJob] = useState<Partial<Job>>({})
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsQuery = query(collection(db, 'jobs'))
        const querySnapshot = await getDocs(jobsQuery)
        const jobsData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
          const jobData = { id: docSnapshot.id, ...docSnapshot.data() } as Job
          if (jobData.assignedTo) {
            const userDocRef = doc(db, 'users', jobData.assignedTo)
            const userDocSnap = await getDoc(userDocRef)
            if (userDocSnap.exists()) {
              jobData.assignedToName = userDocSnap.data().name
            }
          }
          return jobData
        }))
        setJobs(jobsData)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()

    // Set up a real-time listener for job updates
    const unsubscribe = onSnapshot(collection(db, 'jobs'), () => {
      fetchJobs()
    })

    return () => unsubscribe()
  }, [status])

  const handleCreateJob = async () => {
    try {
      const jobToCreate = { ...newJob, status: 'Unassigned' }
      const docRef = await addDoc(collection(db, 'jobs'), jobToCreate)
      setJobs([...jobs, { id: docRef.id, ...jobToCreate } as Job])
      setNewJob({})
    } catch (error) {
      console.error('Error creating new job:', error)
    }
  }

  const handleEditJob = async () => {
    if (!editingJob) return
    try {
      const { id, ...updateData } = editingJob
      await updateDoc(doc(db, 'jobs', id), updateData)
      setJobs(jobs.map(job => job.id === editingJob.id ? editingJob : job))
      setEditingJob(null)
    } catch (error) {
      console.error('Error updating job:', error)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', jobId))
      setJobs(jobs.filter(job => job.id !== jobId))
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  const scheduleVanService = async (vanId: string) => {
    try {
      const vanRef = doc(db, 'vans', vanId);
      const vanDoc = await getDoc(vanRef);
      
      if (vanDoc.exists()) {
        const vanData = vanDoc.data();
        const lastServiceDate = vanData.lastServiceDate ? new Date(vanData.lastServiceDate) : new Date();
        const nextServiceDate = addMonths(lastServiceDate, 2);

        await setDoc(doc(db, 'vanServices'), {
          vanId,
          scheduledDate: nextServiceDate,
          status: 'Scheduled'
        });

        await updateDoc(vanRef, {
          nextServiceDate
        });

        alert(`Van service scheduled for ${nextServiceDate.toDateString()}`);
      }
    } catch (error) {
      console.error('Error scheduling van service:', error);
    }
  };

  const unassignedJobs = jobs.filter((job) => !job.assignedTo)
  const assignedJobs = jobs.filter((job) => job.assignedTo)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
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
      
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4">Create New Job</Button>
        </DialogTrigger>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input id="date" type="date" className="col-span-3" value={newJob.date || ''} onChange={(e) => setNewJob({...newJob, date: e.target.value})} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select onValueChange={(value) => setNewJob({...newJob, type: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="servicing">Servicing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">Brand</Label>
              <Select onValueChange={(value) => setNewJob({...newJob, brand: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M Electric">M Electric</SelectItem>
                  <SelectItem value="Dicon">Dicon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">Location</Label>
              <Input id="location" className="col-span-3" value={newJob.location || ''} onChange={(e) => setNewJob({...newJob, location: e.target.value})} />
            </div>
          </div>
          <Button onClick={handleCreateJob}>Create Job</Button>
        </DialogContent>
      </Dialog>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Unassigned Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unassignedJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.date}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>{job.brand}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.assignedToName || 'Unassigned'}</TableCell>
                  <TableCell>{job.status}</TableCell>
                  <TableCell>
                    <Button variant="destructive" onClick={() => handleDeleteJob(job.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-6">
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
                <TableHead>Assigned To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.date}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>{job.brand}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.assignedToName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingJob && (
        <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-date" className="text-right">Date</Label>
                <Input id="edit-date" type="date" className="col-span-3" value={editingJob.date} onChange={(e) => setEditingJob({...editingJob, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-type" className="text-right">Type</Label>
                <Select value={editingJob.type} onValueChange={(value) => setEditingJob({...editingJob, type: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="installation">Installation</SelectItem>
                    <SelectItem value="servicing">Servicing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-brand" className="text-right">Brand</Label>
                <Select value={editingJob.brand} onValueChange={(value) => setEditingJob({...editingJob, brand: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M Electric">M Electric</SelectItem>
                    <SelectItem value="Dicon">Dicon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-location" className="text-right">Location</Label>
                <Input id="edit-location" className="col-span-3" value={editingJob.location} onChange={(e) => setEditingJob({...editingJob, location: e.target.value})} />
              </div>
            </div>
            <Button onClick={handleEditJob}>Save Changes</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}