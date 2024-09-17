'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Briefcase } from "lucide-react"
import Link from 'next/link'

export function TechnicianLandingPageComponent() {
  // Mock data - replace with actual data fetching logic
  const weeklyWorkload = [
    { day: "Monday", hours: 8, jobs: 3 },
    { day: "Tuesday", hours: 7, jobs: 2 },
    { day: "Wednesday", hours: 9, jobs: 4 },
    { day: "Thursday", hours: 8, jobs: 3 },
    { day: "Friday", hours: 6, jobs: 2 },
    { day: "Saturday", hours: 4, jobs: 1 },
    { day: "Sunday", hours: 0, jobs: 0 },
  ]

  const totalHours = weeklyWorkload.reduce((sum, day) => sum + day.hours, 0)
  const totalJobs = weeklyWorkload.reduce((sum, day) => sum + day.jobs, 0)

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
              <p className="text-2xl font-bold">{totalHours}</p>
              <p className="text-sm text-gray-500">Total Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{totalJobs}</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Monthly Workload Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-2">Total hours this month: <span className="font-bold">160</span></p>
          <p className="text-lg mb-2">Total jobs this month: <span className="font-bold">45</span></p>
          <p className="text-sm text-gray-500">
            View your Manage Jobs page for more detailed information about your assignments.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}