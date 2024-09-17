'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AllocateStaff() {
  // Mock data - replace with actual data fetching logic
  const [jobs, setJobs] = useState([
    { id: 1, date: '2023-06-01', type: 'Installation', brand: 'M Electric', location: '123 Main St', assigned: '' },
    { id: 2, date: '2023-06-02', type: 'Servicing', brand: 'Dicon', location: '456 Elm St', assigned: '' },
    { id: 3, date: '2023-06-03', type: 'Installation', brand: 'M Electric', location: '789 Oak St', assigned: '' },
  ])

  const [availableStaff, setAvailableStaff] = useState([
    { id: 1, name: 'John Doe', role: 'Technician', brand: 'M Electric', workload: '38 hours' },
    { id: 2, name: 'Jane Smith', role: 'Technician', brand: 'Dicon', workload: '32 hours' },
    { id: 3, name: 'Bob Johnson', role: 'Driver', brand: 'N/A', workload: '40 hours' },
  ])

  const handleAssign = (jobId: number, staffId: string) => {
    // Handle job assignment logic here
    console.log(`Assigning job ${jobId} to staff ${staffId}`)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Allocate Staff</h1>
      
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
                <TableHead>Assign To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.date}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>{job.brand}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>
                    <Select onValueChange={(value) => handleAssign(job.id, value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select staff" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStaff.map((staff) => (
                          <SelectItem key={staff.id} value={staff.id.toString()}>
                            {staff.name} ({staff.brand})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                <TableHead>Current Workload</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>{staff.brand}</TableCell>
                  <TableCell>{staff.workload}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}