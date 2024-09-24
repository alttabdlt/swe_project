'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Users, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { GanttChart } from './GanttChart'

interface StaffWorkload {
  id: string
  name: string
  hours: number
}

interface Job {
  id: string
  driverAssigned?: string
  technicianAssigned?: string
  type: string
  date: string
  endDate?: string
  status: string
  allocatedTime: number
}

type GanttChartData = [
  string,
  string,
  Date,
  Date,
  number | null,
  number,
  string | null
]

export function ManagerLandingPageComponent() {
  const [lowestWorkloadStaff, setLowestWorkloadStaff] = useState<StaffWorkload[]>(
    []
  )
  const [workloadData, setWorkloadData] = useState<GanttChartData[]>([])
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const calculateWorkload = (
    jobs: Job[],
    usersData: { [key: string]: string }
  ) => {
    const workloadMap: { [key: string]: number } = {}
    jobs.forEach((job) => {
      const allocatedTime = job.allocatedTime || 4

      if (job.driverAssigned) {
        workloadMap[job.driverAssigned] =
          (workloadMap[job.driverAssigned] || 0) + allocatedTime
      }

      if (job.technicianAssigned) {
        workloadMap[job.technicianAssigned] =
          (workloadMap[job.technicianAssigned] || 0) + allocatedTime
      }
    })

    const staffWorkloadArray = Object.entries(workloadMap).map(
      ([staffId, hours]) => ({
        id: staffId,
        name: usersData[staffId] || 'Unknown',
        hours,
      })
    )

    return staffWorkloadArray
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'))
        const usersData: { [key: string]: string } = {}
        usersSnapshot.forEach((doc) => {
          const data = doc.data()
          usersData[doc.id] = data.name || 'Unknown'
        })

        // Fetch jobs
        const jobsSnapshot = await getDocs(collection(db, 'jobs'))
        const jobsData = jobsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Job[]

        // Calculate workload
        const workload = calculateWorkload(jobsData, usersData)

        // Get top 3 staff with least hours worked
        const sortedWorkload = workload.sort((a, b) => a.hours - b.hours)
        const top3LeastHours = sortedWorkload.slice(0, 3)
        setLowestWorkloadStaff(top3LeastHours)

        // Prepare data for Gantt chart
        const formattedData: GanttChartData[] = jobsData.flatMap((job) => {
          const entries: GanttChartData[] = []
          const allocatedTimeMs = (job.allocatedTime || 4) * 60 * 60 * 1000
          const startDate = new Date(job.date)
          const endDate = new Date(startDate.getTime() + allocatedTimeMs)

          if (job.driverAssigned) {
            const driverName = usersData[job.driverAssigned] || 'Unknown Driver'
            entries.push([
              driverName,
              `${job.type} (Driver)`,
              startDate,
              endDate,
              null,
              job.status === 'Completed' ? 100 : 0,
              null,
            ])
          }

          if (job.technicianAssigned) {
            const technicianName =
              usersData[job.technicianAssigned] || 'Unknown Technician'
            entries.push([
              technicianName,
              `${job.type} (Technician)`,
              startDate,
              endDate,
              null,
              job.status === 'Completed' ? 100 : 0,
              null,
            ])
          }

          return entries
        })

        setWorkloadData(formattedData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
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

      {/* Top 3 Staff with Least Hours Worked */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top 3 Staff with Least Hours Worked</CardTitle>
        </CardHeader>
        <CardContent>
          <ul>
            {lowestWorkloadStaff.map((staff) => (
              <li key={staff.id} className="mb-2">
                <span className="font-semibold">{staff.name}</span> -{' '}
                {staff.hours} hours
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Gantt Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Staff Workload Gantt Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <GanttChart data={workloadData} />
        </CardContent>
      </Card>

      <Button onClick={handleLogout} className="mt-6 w-full">
        Logout
      </Button>
    </div>
  )
}