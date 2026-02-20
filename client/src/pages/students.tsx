import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, Download, FileText, Upload, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface StudentListItem {
  id: string;
  name: string | null;
  email: string | null;
  topics: string[];
  rawResumeText: string | null;
  rawTranscriptText: string | null;
  createdAt: string;
}

export default function Students() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: students = [], isLoading } = useQuery<StudentListItem[]>({
    queryKey: ["/api/students"],
  });

  const filtered = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      s.topics.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Student Directory</h1>
            <p className="text-muted-foreground">Manage inferred interest profiles for all students.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="gap-2"><Filter className="w-4 h-4"/> Filter</Button>
            <Button variant="outline" className="gap-2"><Download className="w-4 h-4"/> Export</Button>
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-md"><Plus className="w-4 h-4"/> Add Student</Button>
              </DialogTrigger>
              <StudentUploadDialog
                onSuccess={(student) => {
                  setUploadOpen(false);
                  if (student) {
                    const listItem: StudentListItem = {
                      id: student.id,
                      name: student.name ?? null,
                      email: student.email ?? null,
                      topics: student.topics ?? [],
                      rawResumeText: student.rawResumeText ?? null,
                      rawTranscriptText: student.rawTranscriptText ?? null,
                      createdAt: student.createdAt,
                    };
                    queryClient.setQueryData<StudentListItem[]>(["/api/students"], (prev) =>
                      prev ? [listItem, ...prev] : [listItem]
                    );
                  }
                  queryClient.invalidateQueries({ queryKey: ["/api/students"] });
                  toast({
                    title: "Student added",
                    description: student?.topics?.length
                      ? `Profile created with ${student.topics.length} topic(s).`
                      : "Profile created and topics extracted.",
                  });
                }}
                onError={(msg) => {
                  toast({ title: "Upload failed", description: msg, variant: "destructive" });
                }}
              />
            </Dialog>
          </div>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-muted/10 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name, email, or interest..."
                className="pl-9 bg-background border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <span className="text-sm text-muted-foreground">{filtered.length} students</span>
          </div>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                {students.length === 0
                  ? "No students yet. Upload a resume or transcript to get started."
                  : "No students match your search."}
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Topics</th>
                    <th className="px-6 py-4 font-medium">Resume</th>
                    <th className="px-6 py-4 font-medium">Transcript</th>
                    <th className="px-6 py-4 font-medium">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filtered.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{student.name || "—"}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{student.email || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap max-w-[300px]">
                          {student.topics.slice(0, 4).map((t) => (
                            <span key={t} className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border/50 capitalize">
                              {t}
                            </span>
                          ))}
                          {student.topics.length > 4 && (
                            <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                              +{student.topics.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.rawResumeText ? (
                          <span className="text-xs font-medium text-primary flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {student.rawTranscriptText ? (
                          <span className="text-xs font-medium text-primary flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function StudentUploadDialog({
  onSuccess,
  onError,
}: {
  onSuccess: (student?: { id: string; name: string | null; email: string | null; topics: string[]; rawResumeText: string | null; rawTranscriptText: string | null; createdAt: string }) => void;
  onError: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!resumeFile && !transcriptFile) {
      onError("At least one of resume or transcript is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (name) formData.append("name", name);
      if (email) formData.append("email", email);
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
      onSuccess(data.student);
    } catch (err: any) {
      onError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Student</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input placeholder="Student name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input placeholder="student@umich.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Resume (PDF)</Label>
          <Input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          />
        </div>
        <div className="space-y-2">
          <Label>Transcript (PDF)</Label>
          <Input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          At least one file required. Max 10 MB each. Topics will be auto-extracted.
        </p>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isSubmitting ? "Uploading..." : "Upload & Create"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
