import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            UniConnect CRM
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            AI-powered CRM for cross-center student engagement
          </p>
          <p className="text-md text-gray-600 mt-2">
            Stop sending spam—send the right opportunity to the right student at the right time
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            href="/manager"
            className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Center Manager
            </h2>
            <p className="text-gray-600">
              Create events, target students, and track engagement
            </p>
            <div className="mt-4 text-primary-600 font-medium">
              Go to Dashboard →
            </div>
          </Link>

          <Link
            href="/student/onboard"
            className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Student
            </h2>
            <p className="text-gray-600">
              Get personalized opportunities, no more spam
            </p>
            <div className="mt-4 text-primary-600 font-medium">
              Get Started →
            </div>
          </Link>
        </div>

        <div className="mt-16 max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            How It Works
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Students Onboard</h4>
                <p className="text-gray-600">Upload resume or fill profile—AI extracts interests automatically</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Centers Create Events</h4>
                <p className="text-gray-600">Tag topics, set match threshold, see exactly who cares</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">AI Matches & Delivers</h4>
                <p className="text-gray-600">One weekly digest per student with best-matched opportunities</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Learn & Improve</h4>
                <p className="text-gray-600">Student feedback updates their profile—gets smarter over time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
