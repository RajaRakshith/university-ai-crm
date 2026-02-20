import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Briefcase } from 'lucide-react';

export default function Landing() {
  const [, setLocation] = useLocation();
  const { setRole } = useAuth();

  const selectRole = (role: 'student' | 'organizer', isReturning: boolean = false) => {
    setRole(role);
    // Use setTimeout to ensure localStorage is written before navigation
    setTimeout(() => {
      if (role === 'student') {
        setLocation(isReturning ? '/student/login' : '/student/onboard');
      } else {
        setLocation('/organizer/dashboard');
      }
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            University Event Matching Platform
          </h1>
          <p className="text-lg text-gray-600">
            Connect students with opportunities using AI-powered matching
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Student Card */}
          <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-blue-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">I'm a Student</CardTitle>
              <CardDescription className="text-base">
                Find events and opportunities matched to your interests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  Upload your resume and transcript
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  Get AI-powered interest analysis
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  Discover personalized event recommendations
                </li>
              </ul>
              <div className="space-y-2">
                <Button 
                  onClick={() => selectRole('student', false)} 
                  className="w-full"
                  size="lg"
                >
                  Create New Account
                </Button>
                <Button 
                  onClick={() => selectRole('student', true)} 
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Sign In (Returning Student)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Organizer Card */}
          <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-purple-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">I'm an Organizer</CardTitle>
              <CardDescription className="text-base">
                Create events and find the right students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  Create events with specific requirements
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  Define topics and student criteria
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2">✓</span>
                  Find best-matched students automatically
                </li>
              </ul>
              <Button 
                onClick={() => selectRole('organizer')} 
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                Continue as Organizer
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          Powered by Oracle Cloud AI • Secure • Privacy-First
        </div>
      </div>
    </div>
  );
}
