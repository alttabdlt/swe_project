'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Briefcase } from "lucide-react"
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface WorkloadDay {
  day: string;
  hours: number;
  jobs: number;
}

interface Job {
  id: string;
  date: string;
  type: string;
  brand: string;
  location: string;
  status: string;
  allocatedTime: number;
}

export function TechnicianLandingPageComponent() {
  const [weeklyWorkload, setWeeklyWorkload] = useState<WorkloadDay[]>([])
  const [monthlyWorkload, setMonthlyWorkload] = useState({ totalHours: 0, totalJobs: 0 })
  const [jobs, setJobs] = useState<Job[]>([])
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchWorkload = async () => {
      // Mock data
      const mockJobs: Job[] = [
        { id: '1', date: '2023-10-01', type: 'Installation', brand: 'Dicon', location: 'Pasir Ris', status: 'Confirmed', allocatedTime: 4 },
        { id: '2', date: '2023-10-02', type: 'Servicing', brand: 'M Electric', location: 'Tampines', status: 'In Progress', allocatedTime: 3 },
        { id: '3', date: '2023-10-03', type: 'Installation & Servicing', brand: 'Dicon', location: 'Bedok', status: 'Confirmed', allocatedTime: 5 },
        { id: '4', date: '2023-10-04', type: 'Installation', brand: 'M Electric', location: 'Jurong', status: 'In Progress', allocatedTime: 2 },
        { id: '5', date: '2023-10-05', type: 'Servicing', brand: 'Dicon', location: 'Ang Mo Kio', status: 'Confirmed', allocatedTime: 4 },
      ]

      const weeklyWorkload = [
        { day: "Sunday", hours: 0, jobs: 0 },
        { day: "Monday", hours: 0, jobs: 0 },
        { day: "Tuesday", hours: 0, jobs: 0 },
        { day: "Wednesday", hours: 0, jobs: 0 },
        { day: "Thursday", hours: 0, jobs: 0 },
        { day: "Friday", hours: 0, jobs: 0 },
        { day: "Saturday", hours: 0, jobs: 0 },
      ]

      let totalHours = 0
      let totalJobs = mockJobs.length

      mockJobs.forEach(job => {
        if (job.date) {
          const date = new Date(job.date)
          const dayIndex = date.getDay()
          const jobHours = job.allocatedTime || 4
          weeklyWorkload[dayIndex].hours += jobHours
          weeklyWorkload[dayIndex].jobs += 1
          totalHours += jobHours
        }
      })

      setWeeklyWorkload(weeklyWorkload)
      setMonthlyWorkload({ totalHours, totalJobs })
      setJobs(mockJobs)
    }

    fetchWorkload()
  }, [session])

  const handleLogout = () => {
    signOut()
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Technician Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Link href="/technician/manage-availability">
          <Button className="h-16 text-lg w-full">
            <Calendar className="mr-2 h-6 w-6" /> Manage Availability
          </Button>
        </Link>
        <Link href="/technician/manage-jobs">
          <Button className="h-16 text-lg w-full">
            <Briefcase className="mr-2 h-6 w-6" /> Manage Jobs
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Weekly Workload Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{monthlyWorkload.totalHours}</p>
              <p className="text-sm text-gray-500">Total Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{monthlyWorkload.totalJobs}</p>
              <p className="text-sm text-gray-500">Total Jobs</p>
            </div>
          </div>
          <div className="space-y-2">
            {weeklyWorkload.map((day, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-semibold">{day.day}</span>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{day.hours} hours</span>
                  <Briefcase className="ml-4 mr-2 h-4 w-4 text-gray-500" />
                  <span>{day.jobs} jobs</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upcoming Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.slice(0, 5).map((job) => (
            <div key={job.id} className="mb-2">
              <p className="font-semibold">{job.date} - {job.type}</p>
              <p className="text-sm text-gray-500">{job.brand} - {job.location}</p>
              <p className="text-sm text-gray-500">Allocated time: {job.allocatedTime} hours</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Workload Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-2">Total hours this month: <span className="font-bold">{monthlyWorkload.totalHours}</span></p>
          <p className="text-lg mb-2">Total jobs this month: <span className="font-bold">{monthlyWorkload.totalJobs}</span></p>
          <p className="text-sm text-gray-500">
            View your Manage Jobs page for more detailed information about your assignments.
          </p>
        </CardContent>
      </Card>

      <Button onClick={handleLogout} className="mt-6 w-full">
        Logout
      </Button>
    </div>
  )
}