import { Link } from "wouter";
import { GraduationCap, Briefcase, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Splash() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 flex flex-col items-center justify-center p-6">
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight text-foreground">
            OpportUNI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Connect students with opportunities using AI-powered matching
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Student Card */}
          <Card className="bg-white dark:bg-gray-900 border-2 border-transparent hover:border-primary/20 shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-heading">I'm a Student</h2>
                <p className="text-muted-foreground">
                  Find events and opportunities matched to your interests
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Upload your resume and transcript
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Get AI-powered interest analysis
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Discover personalized event recommendations
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Link href="/auth/register/student">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Create New Account
                  </Button>
                </Link>
                <Link href="/auth/login?role=student">
                  <Button variant="outline" className="w-full border-purple-300 dark:border-purple-700">
                    Sign In (Returning Student)
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Organizer Card */}
          <Card className="bg-white dark:bg-gray-900 border-2 border-transparent hover:border-primary/20 shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold font-heading">I'm an Organizer</h2>
                <p className="text-muted-foreground">
                  Create events and find the right students
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Create events with specific requirements
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Define topics and student criteria
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Find best-matched students automatically
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/auth/login?role=organizer">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Continue as Organizer
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8">
          Powered by Oracle Cloud AI • Secure • Privacy-First
        </div>
      </div>
    </div>
  );
}
