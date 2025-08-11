import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Coursework Management System
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            A comprehensive platform for teachers and students to manage assignments, 
            submissions, and grading efficiently.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/about" 
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Teachers</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Create and manage assignments</li>
              <li>• Set deadlines and mark allocations</li>
              <li>• Grade submissions efficiently</li>
              <li>• Provide detailed feedback</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Students</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• View upcoming assignments</li>
              <li>• Submit work online</li>
              <li>• Track marks and feedback</li>
              <li>• Get instant notifications</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Admins</h3>
            <ul className="text-gray-600 space-y-2">
              <li>• Manage user accounts</li>
              <li>• View performance reports</li>
              <li>• System administration</li>
              <li>• Analytics dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}