'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export function TechnicianManageJobs() {
  // Mock data - replace with actual data fetching logic
  const [jobs, setJobs] = useState([
    { id: 1, date: '2023-06-01', type: 'Installation', brand: 'M Electric', location: '123 Main St', status: 'Assigned' },
    { id: 2, date: '2023-06-02', type: 'Servicing', brand: 'Dicon', location: '456 Elm St', status: 'Completed' },
    { id: 3, date: '2023-06-03', type: 'Installation', brand: 'M Electric', location: '789 Oak St', status: 'Assigned' },
  ])

  const handleRejectJob = (jobId: number) => {
    // Handle job rejection logic here
    console.log(`Rejecting job ${jobId}`)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Jobs</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Job Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell>{job.status}</TableCell>
                  <TableCell>
                    {job.status === 'Assigned' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">Reject</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to reject this job?</AlertDialogTitle>
                            <AlertDialogDescription>
                              You will be warned to discuss this job with your manager before proceeding with the rejection.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRejectJob(job.id)}>Reject Job</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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