import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle2, FileText, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function StudentUpload() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedStudentId, setUploadedStudentId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!resumeFile && !transcriptFile) {
      toast({
        title: "Files required",
        description: "At least one of resume or transcript is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (name) formData.append("name", name);
      if (email) formData.append("email", email);
      if (phoneNumber) formData.append("phoneNumber", phoneNumber);
      if (resumeFile) formData.append("resume", resumeFile);
      if (transcriptFile) formData.append("transcript", transcriptFile);

      const res = await fetch("/api/students/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(body.error || "Upload failed");
      }

      const data = await res.json();
      const studentId = data.student?.id || data.id;
      
      if (studentId) {
        // Store student ID in localStorage for persistence
        localStorage.setItem("student-id", studentId);
        setUploadedStudentId(studentId);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/students"] });
        queryClient.invalidateQueries({ queryKey: ["/api/students", studentId] });
        queryClient.invalidateQueries({ queryKey: ["/api/students", studentId, "match"] });
        
        toast({
          title: "Profile created",
          description: `Successfully created profile with ${data.student?.topics?.length || 0} topic(s) extracted.`,
        });
        
        // Redirect to profile after a short delay
        setTimeout(() => {
          setLocation(`/student/profile?id=${studentId}`);
        }, 2000);
      } else {
        throw new Error("No student ID returned from server");
      }
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "An error occurred while uploading.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Create Your Profile</h1>
          <p className="text-muted-foreground">
            Upload your resume and transcript to get started. Our AI will analyze your documents and extract your skills and interests.
          </p>
        </div>

        {uploadedStudentId ? (
          <Card className="border-green-500/50 bg-green-500/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Profile Created Successfully!</h3>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to your profile...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Upload at least one document to create your profile. PDF format preferred.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (Optional)</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@umich.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1234567890 or (123) 456-7890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Used to receive notifications about matching opportunities via SMS
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resume">Resume (PDF, max 10 MB)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {resumeFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      {resumeFile.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transcript">Transcript (PDF, max 10 MB)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="transcript"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  {transcriptFile && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      {transcriptFile.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Your documents will be securely uploaded and analyzed</li>
                      <li>AI will extract your skills, interests, and expertise areas</li>
                      <li>Your profile will be created and matched with relevant opportunities</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (!resumeFile && !transcriptFile)}
                className="w-full gap-2"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Create Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
