'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart, Users, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { GanttChart } from './GanttChart'

interface StaffWorkload {
  id: string;
  name: string;
  hours: number;
  isOverworked: boolean;
}

interface Job {
  id: string;
  assignedTo?: string;
  type: string;
  date: string; // Changed from startDate
  endDate?: string; // Made optional
  status: string;
  allocatedTime: number; // Add this field
}

type GanttChartData = [string, string, Date, Date, number | null, number, string | null];

export function ManagerLandingPageComponent() {
  const [staffWorkload, setStaffWorkload] = useState<StaffWorkload[]>([])
  const [workloadData, setWorkloadData] = useState<GanttChartData[]>([])
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const calculateWorkload = (jobs: Job[]) => {
    const workload: { [key: string]: number } = {};
    jobs.forEach(job => {
      if (job.assignedTo) {
        workload[job.assignedTo] = (workload[job.assignedTo] || 0) + (job.allocatedTime || 8);
      }
    });
    return workload;
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsQuery = query(collection(db, 'jobs'));
        const querySnapshot = await getDocs(jobsQuery);
        const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        const workload = calculateWorkload(jobsData);

        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().name;
          return acc;
        }, {} as {[key: string]: string});

        const staffWorkloadData = Object.entries(workload).map(([staffId, hours]) => ({
          id: staffId,
          name: usersData[staffId] || 'Unknown',
          hours,
          isOverworked: hours > 40
        }));

        setStaffWorkload(staffWorkloadData);

        // Prepare data for Gantt chart
        const formattedData: GanttChartData[] = jobsData.map(job => {
          const startDate = new Date(job.date);
          const endDate = job.endDate ? new Date(job.endDate) : new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
          return [
            usersData[job.assignedTo || ''] || 'Unassigned',
            job.type,
            startDate,
            endDate,
            null, // Duration (calculated automatically by Google Charts)
            job.status === 'Completed' ? 100 : 0, // Percent complete
            null // Dependencies (not used in this example)
          ];
        });

        setWorkloadData(formattedData);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, []);

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  const lowestWorkloadStaff = [...staffWorkload].sort((a, b) => a.hours - b.hours).slice(0, 3)

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Link href="/manager/manage-jobs">
          <Button className="h-16 text-lg w-full">
            <Briefcase className="mr-2 h-6 w-6" /> Manage Jobs
          </Button>
        </Link>
        <Link href="/manager/manage-staff">
          <Button className="h-16 text-lg w-full">
            <Users className="mr-2 h-6 w-6" /> Manage Staff
          </Button>
        </Link>
        <Link href="/manager/allocate-staff">
          <Button className="h-16 text-lg w-full">
            <Users className="mr-2 h-6 w-6" /> Allocate Staff
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Staff with Lowest Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {lowestWorkloadStaff.map((staff) => (
              <li key={staff.id} className="mb-2">
                <span className="font-semibold">{staff.name}</span> - {staff.hours} hours
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Staff Workload Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <GanttChart data={workloadData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staff Workload Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {staffWorkload.map((staff) => (
            <div key={staff.id} className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">{staff.name}</span>
              </div>
              <Progress value={(staff.hours / 50) * 100} className="h-2" />
              <div className="flex justify-between text-sm mt-1">
                <span>{staff.hours} hours</span>
                <span className={staff.isOverworked ? 'text-red-500' : 'text-green-500'}>
                  {staff.isOverworked ? 'Overworked' : 'Normal'}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleLogout} className="mt-6 w-full">
        Logout
      </Button>
    </div>
  )
}