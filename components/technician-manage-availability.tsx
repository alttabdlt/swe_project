'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TechnicianManageAvailability() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [availability, setAvailability] = useState<string>('available')
  const [jobPreference, setJobPreference] = useState<string>('')

  const handleSaveAvailability = () => {
    // Handle saving availability logic here
    console.log('Saving availability:', { selectedDates, availability, jobPreference })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Availability</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={setSelectedDates}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Set Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                Availability Status
              </label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                  <SelectItem value="leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="jobPreference" className="block text-sm font-medium text-gray-700 mb-1">
                Job Preference
              </label>
              <Select value={jobPreference} onValueChange={setJobPreference}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="servicing">Servicing</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveAvailability} className="w-full">
              Save Availability
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}