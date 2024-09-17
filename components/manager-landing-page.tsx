'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Users, Briefcase, AlertTriangle } from "lucide-react"
import Link from 'next/link'

export function ManagerLandingPageComponent() {
  // Mock data - replace with actual data fetching logic
  const staffWorkload = [
    { name: "John Doe", hours: 45, preference: "M Electric" },
    { name: "Jane Smith", hours: 38, preference: "Dicon" },
    { name: "Bob Johnson", hours: 42, preference: "Both" },
    { name: "Alice Brown", hours: 35, preference: "M Electric" },
    { name: "Charlie Davis", hours: 48, preference: "Dicon" },
  ]

  const lowestWorkloadStaff = staffWorkload
    .sort((a, b) => a.hours - b.hours)
    .slice(0, 3)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Staff with Lowest Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {lowestWorkloadStaff.map((staff, index) => (
                <li key={index} className="mb-2">
                  <span className="font-semibold">{staff.name}</span> - {staff.hours} hours
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overworked Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {staffWorkload
                .filter((staff) => staff.hours > 40)
                .map((staff, index) => (
                  <li key={index} className="mb-2 flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">{staff.name}</span> - {staff.hours} hours
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Workload Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {staffWorkload.map((staff, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold">{staff.name}</span>
                <span className="text-sm text-gray-500">Preference: {staff.preference}</span>
              </div>
              <Progress value={(staff.hours / 50) * 100} className="h-2" />
              <div className="flex justify-between text-sm mt-1">
                <span>{staff.hours} hours</span>
                <span className={staff.hours > 40 ? "text-red-500" : "text-green-500"}>
                  {staff.hours > 40 ? "Overworked" : "Normal"}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}