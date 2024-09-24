'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, updateDoc, deleteDoc, doc, query, where, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader,TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { isWeekend, isPublicHoliday } from '@/lib/dateUtils'
import { Input } from '@/components/ui/input'

interface Job {
  id: string;
  date: string;
  type: string;
  brand: string;
  location: string;
  assignedTo?: string;
  assignedToName?: string;
  status: string;
  allocatedTime?: number;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  brand: string;
  availability: string[];
  workload: number;
  preference: string;
}

export default function AllocateStaff() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([])
  const [allocatedTime, setAllocatedTime] = useState<number>(8)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsQuery = query(collection(db, 'jobs'));
        const querySnapshot = await getDocs(jobsQuery);
        const jobsData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
          const jobData = { id: docSnapshot.id, ...docSnapshot.data() } as Job;
          if (jobData.assignedTo) {
            const userDocRef = doc(db, 'users', jobData.assignedTo);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              jobData.assignedToName = userDocSnap.data().name;
            }
          }
          return jobData;
        }));
        setJobs(jobsData);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();

    const unsubscribe = onSnapshot(collection(db, 'jobs'), () => {
      fetchJobs();
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const staffQuery = query(collection(db, 'users'), where('role', 'in', ['staff', 'technician']));
        const querySnapshot = await getDocs(staffQuery);
        const staffData = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const availability = await fetchStaffAvailability(doc.id);
          return {
            id: doc.id,
            name: data.name || 'Unknown',
            role: data.role || 'Unknown',
            brand: data.brand || 'Not specified',
            availability: availability ? availability.dates : [],
            workload: data.workload || 0,
            preference: availability ? availability.jobPreference : 'Not specified'
          } as StaffMember;
        }));
        setAvailableStaff(staffData);
      } catch (error) {
        console.error('Error fetching staff:', error);
      }
    };

    fetchStaff();
  }, []);

  const fetchStaffAvailability = async (staffId: string) => {
    try {
      const docRef = doc(db, 'staffAvailability', staffId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching staff availability:', error);
      return null;
    }
  };

  const handleAssign = async (jobId: string, staffId: string) => {
    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);
      const jobData = jobDoc.data();

      const staffRef = doc(db, 'users', staffId);
      const staffDoc = await getDoc(staffRef);
      const staffData = staffDoc.data();

      if (jobData && staffData) {
        // Check brand qualification
        if (jobData.brand !== staffData.brand && staffData.brand !== 'both') {
          alert("This technician is not qualified for this brand.");
          return;
        }

        const jobDate = new Date(jobData.date);
        
        // Check if it's a weekend or public holiday
        if (isWeekend(jobDate) || isPublicHoliday(jobDate)) {
          alert("Cannot assign jobs on weekends or public holidays.");
          return;
        }

        // Check the number of vans already assigned for this date
        const assignedVansQuery = query(
          collection(db, 'jobs'),
          where('date', '==', jobData.date),
          where('status', '==', 'Assigned')
        );
        const assignedVansSnapshot = await getDocs(assignedVansQuery);
        
        if (assignedVansSnapshot.size >= 3) {
          alert("Maximum number of vans (3) already assigned for this date.");
          return;
        }

        // Check staff availability
        const staffAvailability = await fetchStaffAvailability(staffId);
        if (staffAvailability && !staffAvailability.dates.includes(jobData.date)) {
          alert("This staff member is not available on the selected date.");
          return;
        }
      }

      // Proceed with assignment if checks pass
      await updateDoc(jobRef, {
        assignedTo: staffId,
        status: 'Assigned',
        allocatedTime: allocatedTime
      });

      // Update local state
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, assignedTo: staffId, status: 'Assigned', allocatedTime: allocatedTime } : job
        )
      );
    } catch (error) {
      console.error('Error assigning job:', error);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', jobId))
      console.log(`Deleted job ${jobId}`)
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId))
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  const unassignedJobs = jobs.filter((job) => !job.assignedTo)
  const assignedJobs = jobs.filter((job) => job.assignedTo)

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Allocate Staff</h1>
        <Link href="/manager">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
          </Button>
        </Link>
      </div>

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
                <TableHead>Allocated Time (hours)</TableHead>
                <TableHead>Assign To</TableHead>
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
                  <TableCell>
                    <Input
                      type="number"
                      value={allocatedTime}
                      onChange={(e) => setAllocatedTime(Number(e.target.value))}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Select onValueChange={(value) => handleAssign(job.id, value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStaff.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id}>
                            {staff.name} ({staff.brand})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
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
                <TableHead>Actions</TableHead>
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

      <Card>
        <CardHeader>
          <CardTitle>Available Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Current Workload</TableHead>
                <TableHead>Preference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>{staff.brand}</TableCell>
                  <TableCell>
                    {Array.isArray(staff.availability) ? staff.availability.join(', ') : 'Not specified'}
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