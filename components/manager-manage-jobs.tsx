'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Briefcase, Users } from "lucide-react"
import Link from 'next/link'

export function ManagerManageJobs() {
  // Mock data - replace with actual data fetching logic
  const [jobs, setJobs] = useState([
    { id: 1, date: '2023-06-01', type: 'Installation', brand: 'M Electric', location: '123 Main St', assigned: 'John Doe' },
    { id: 2, date: '2023-06-02', type: 'Servicing', brand: 'Dicon', location: '456 Elm St', assigned: 'Jane Smith' },
    { id: 3, date: '2023-06-03', type: 'Installation', brand: 'M Electric', location: '789 Oak St', assigned: 'Unassigned' },
  ])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Jobs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Link href="/manager/allocate-staff">
          <Button className="w-full h-16 text-lg">
            <Users className="mr-2 h-6 w-6" /> Allocate Staff
          </Button>
        </Link>
        <Link href="/manager/manage-staff">
          <Button className="w-full h-16 text-lg">
            <Briefcase className="mr-2 h-6 w-6" /> Manage Staff
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Assignments</CardTitle>
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
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.date}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>{job.brand}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.assigned}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Edit</Button>
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