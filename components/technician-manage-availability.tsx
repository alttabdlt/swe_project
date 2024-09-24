'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const adjustDateToUTC = (date: Date): Date => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
};

export function TechnicianManageAvailability() {
  const router = useRouter()
  const { data: session } = useSession()
  const userEmail = session?.user?.email
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [availability, setAvailability] = useState<string>('available')
  const [jobPreference, setJobPreference] = useState<string>('both')

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!session?.user?.email) return

      try {
        const docRef = doc(db, 'technicianAvailability', session.user.email)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setSelectedDates(data.dates.map((dateString: string) => new Date(dateString)))
          setAvailability(data.availability)
          setJobPreference(data.jobPreference)
        }
      } catch (error) {
        console.error('Error fetching availability:', error)
      }
    }

    fetchAvailability()
  }, [session])

  const handleSaveAvailability = async () => {
    if (!selectedDates.length || !userEmail) return;

    try {
      const docRef = doc(db, 'technicianAvailability', userEmail);
      await setDoc(docRef, {
        dates: selectedDates.map(date => adjustDateToUTC(date).toISOString().split('T')[0]),
        availability,
        jobPreference,
      });
      console.log('Availability saved:', { selectedDates, availability, jobPreference });
      router.push('/technician');
    } catch (error) {
      console.error('Error saving availability:', error);
    }
  };

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (dates) {
      const uniqueAdjustedDates = Array.from(new Set(dates.map(date => adjustDateToUTC(date).toISOString().split('T')[0])))
        .map(dateString => new Date(dateString));
      setSelectedDates(uniqueAdjustedDates);
    } else {
      setSelectedDates([]);
    }
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Availability</h1>
        <Link href="/technician">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Availability Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={handleDateSelect}
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