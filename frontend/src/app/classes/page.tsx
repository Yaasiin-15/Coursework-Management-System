import ClassManagement from '@/components/ClassManagement'
import AuthCheck from '@/components/AuthCheck'

export default function ClassesPage() {
  return (
    <AuthCheck requiredRole="teacher">
      <ClassManagement />
    </AuthCheck>
  )
}