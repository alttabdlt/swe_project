import ManagerManageJobsComponent from '@/components/manager-manage-jobs'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from 'next/navigation'

export default async function ManageJobsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return <ManagerManageJobsComponent />
}