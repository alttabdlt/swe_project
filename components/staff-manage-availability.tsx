'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebaseConfig'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function StaffManageAvailability() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [availability, setAvailability] = useState<string>('available')
  const [annualLeaveRemaining, setAnnualLeaveRemaining] = useState(7)

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!session?.user?.email) return

      try {
        const docRef = doc(db, 'staffAvailability', session.user.email)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setSelectedDates(data.dates.map((dateString: string) => new Date(dateString)))
          setAvailability(data.availability)
        }
      } catch (error) {
        console.error('Error fetching availability:', error)
      }
    }

    fetchAvailability()
  }, [session])

  useEffect(() => {
    const fetchStaffData = async () => {
      if (!session?.user?.email) return

      try {
        const docRef = doc(db, 'users', session.user.email)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setAnnualLeaveRemaining(data.annualLeaveRemaining || 7)
        }
      } catch (error) {
        console.error('Error fetching staff data:', error)
      }
    }

    fetchStaffData()
  }, [session])

  const handleSaveAvailability = async () => {
    if (!selectedDates.length || !session?.user?.email) return

    const leaveDays = selectedDates.filter(date => availability === 'leave').length
    
    if (leaveDays > annualLeaveRemaining) {
      alert(`You only have ${annualLeaveRemaining} days of annual leave remaining.`);
      return;
    }

    try {
      const docRef = doc(db, 'staffAvailability', session.user.email)
      await setDoc(docRef, {
        dates: selectedDates.map(date => date.toISOString().split('T')[0]),
        availability,
      })
      console.log('Availability saved:', { selectedDates, availability })
      router.push('/staff')

      // Update annual leave remaining
      await updateDoc(doc(db, 'users', session.user.email), {
        annualLeaveRemaining: annualLeaveRemaining - leaveDays
      })

      setAnnualLeaveRemaining(prev => prev - leaveDays)
    } catch (error) {
      console.error('Error saving availability:', error)
    }
  }

  const handleSelectDates = (dates: Date[] | undefined) => {
    if (dates) {
      setSelectedDates(dates)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Availability</h1>
        <Link href="/staff">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Set Your Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={handleSelectDates}
            className="rounded-md border"
          />
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
          <p>Annual Leave Remaining: {annualLeaveRemaining} days</p>
          <Button onClick={handleSaveAvailability} className="w-full">
            Save Availability
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}