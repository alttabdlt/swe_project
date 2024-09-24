import { StaffManageAvailability } from '@/components/staff-manage-availability'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"  // Updated import
import { redirect } from 'next/navigation'

export default async function ManageAvailabilityPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return <StaffManageAvailability />
}