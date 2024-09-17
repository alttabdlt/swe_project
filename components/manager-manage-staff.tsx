'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "lucide-react"

export function ManagerManageStaff() {
  // Mock data - replace with actual data fetching logic
  const [staff, setStaff] = useState([
    { id: 1, name: 'John Doe', role: 'Technician', brand: 'M Electric', availability: 'Available', workload: '38 hours' },
    { id: 2, name: 'Jane Smith', role: 'Technician', brand: 'Dicon', availability: 'On Leave', workload: '0 hours' },
    { id: 3, name: 'Bob Johnson', role: 'Driver', brand: 'N/A', availability: 'Available', workload: '40 hours' },
  ])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Staff</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Staff Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Workload</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.brand}</TableCell>
                  <TableCell>{employee.availability}</TableCell>
                  <TableCell>{employee.workload}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Schedule
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
          <CardTitle>Staff Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Select a date range to view detailed staff availability.
          </p>
          {/* Add a date range picker component here */}
          <Button>View Availability</Button>
        </CardContent>
      </Card>
    </div>
  )
}