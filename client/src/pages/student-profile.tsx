import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { User, Mail, Calendar, Upload, FileText, ChevronDown, ChevronUp, Loader2, Phone, Edit2, Check, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface StudentProfile {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  topics: string[];
  rawResumeText: string | null;
  rawTranscriptText: string | null;
  createdAt: string;
}

export default function StudentProfile() {
  const [location] = useLocation();
  const { profile, isLoading: authLoading } = useAuth();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const urlStudentId = params.get("id");
  // Prefer URL, then localStorage, then logged-in student's profile from auth/me (set at registration)
  const storedStudentId = typeof window !== "undefined" ? localStorage.getItem("student-id") : null;
  const studentId = urlStudentId || storedStudentId || (profile?.id ?? null);
  // Persist profile id so refresh and direct navigation work
  useEffect(() => {
    if (studentId && profile?.id && studentId === profile.id && typeof window !== "undefined" && !localStorage.getItem("student-id")) {
      localStorage.setItem("student-id", studentId);
    }
  }, [studentId, profile?.id]);
  const [showResume, setShowResume] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: student, isLoading, error } = useQuery<StudentProfile>({
    queryKey: studentId ? ["/api/students", studentId] : ["/api/students"],
    enabled: !!studentId,
  });

  // Initialize phone number when student data loads
  useEffect(() => {
    if (student?.phoneNumber) {
      setPhoneNumber(student.phoneNumber);
    }
  }, [student?.phoneNumber]);

  const handleSavePhone = async () => {
    if (!studentId) return;
    
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneNumber || null }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update phone number");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/students", studentId] });
      setIsEditingPhone(false);
      toast({
        title: "Phone number updated",
        description: "Your phone number has been saved.",
      });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "Failed to update phone number.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setPhoneNumber(student?.phoneNumber || "");
    setIsEditingPhone(false);
  };

  if (authLoading && !urlStudentId && !storedStudentId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!studentId) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No student ID provided.</p>
              <Link href="/student/upload">
                <Button>Create Profile</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (error || !student) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Profile not found.</p>
              <Link href="/student/upload">
                <Button>Create New Profile</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const resumePreview = student.rawResumeText
    ? student.rawResumeText.slice(0, 500) + (student.rawResumeText.length > 500 ? "..." : "")
    : null;
  const transcriptPreview = student.rawTranscriptText
    ? student.rawTranscriptText.slice(0, 500) + (student.rawTranscriptText.length > 500 ? "..." : "")
    : null;

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">My Profile</h1>
            <p className="text-muted-foreground">View and manage your profile information</p>
          </div>
          <Link href="/student/upload">
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              Update Profile
            </Button>
          </Link>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{student.name || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{student.email || "Not provided"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Profile Created</p>
                <p className="font-medium">{new Date(student.createdAt).toLocaleDateString("en-US", { 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Phone Number</p>
                {isEditingPhone ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1234567890 or (123) 456-7890"
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSavePhone} className="gap-1">
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit} className="gap-1">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{student.phoneNumber || "Not provided"}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setPhoneNumber(student.phoneNumber || "");
                        setIsEditingPhone(true);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Skills & Interests</CardTitle>
          </CardHeader>
          <CardContent>
            {student.topics.length === 0 ? (
              <p className="text-muted-foreground text-sm">No topics extracted yet. Try uploading your documents.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {student.topics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-sm">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {student.rawResumeText && (
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resume Text</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResume(!showResume)}
                  className="gap-2"
                >
                  {showResume ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            {showResume && (
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {student.rawResumeText}
                  </pre>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {student.rawTranscriptText && (
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Transcript Text</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="gap-2"
                >
                  {showTranscript ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            {showTranscript && (
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {student.rawTranscriptText}
                  </pre>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        <div className="flex justify-center gap-4">
          <Link href={`/student/discover${studentId ? `?id=${studentId}` : ""}`}>
            <Button className="gap-2">
              Discover Opportunities
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
