import AllocateStaff from '@/components/allocate-staff'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from 'next/navigation'

export default async function AllocateStaffPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return <AllocateStaff />
}