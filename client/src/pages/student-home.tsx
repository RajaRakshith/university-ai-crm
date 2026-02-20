import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Upload, Compass, User, ArrowRight, Sparkles } from "lucide-react";

export default function StudentHome() {
  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold font-heading tracking-tight">
            Welcome to UniConnect
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover opportunities that match your skills and interests
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Upload Your Profile</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Upload your resume and transcript to create your profile. Our AI will extract your skills and interests to help you find the perfect opportunities.
                </p>
                <Link href="/student/upload">
                  <Button className="w-full gap-2">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Discover Opportunities</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Browse research opportunities, internships, and events tailored to your profile. Find matches ranked by relevance.
                </p>
                <Link href="/student/discover">
                  <Button variant="outline" className="w-full gap-2">
                    Explore
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 shadow-sm bg-muted/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">AI-Powered Matching</h3>
                <p className="text-sm text-muted-foreground">
                  Our system uses advanced AI to analyze your resume and transcript, extracting your expertise areas and matching you with relevant opportunities. The more complete your profile, the better your matches.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          {typeof window !== "undefined" && localStorage.getItem("student-id") ? (
            <Link href={`/student/profile?id=${localStorage.getItem("student-id")}`}>
              <Button variant="ghost" className="gap-2">
                <User className="w-4 h-4" />
                View Profile
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
}
