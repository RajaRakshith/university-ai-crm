import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, FileText, History, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Student {
  id: string;
  name: string;
  email: string;
  major?: string;
  year?: string;
  resumeUrl?: string;
  transcriptUrl?: string;
  interests: Array<{
    topic: { name: string };
    weight: number;
  }>;
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/students');
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students || []);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </AppLayout>
    );
  }

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
          </div>
        </div>

        {students.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">No students yet</h3>
            <p className="text-muted-foreground">Students will appear here after they onboard</p>
          </Card>
        ) : (
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/10 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search students by name, major, or interest..." 
                  className="pl-9 bg-background border-border/50"
                />
              </div>
            </div>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Major</th>
                    <th className="px-6 py-4 font-medium">Year</th>
                    <th className="px-6 py-4 font-medium">Top Interests</th>
                    <th className="px-6 py-4 font-medium">Resume</th>
                    <th className="px-6 py-4 font-medium">Transcript</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{student.name}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                      <td className="px-6 py-4">{student.major || 'N/A'}</td>
                      <td className="px-6 py-4">{student.year || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap max-w-xs">
                          {student.interests.slice(0, 3).map((i, idx) => (
                            <span key={idx} className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border/50">
                              {i.topic.name}
                            </span>
                          ))}
                          {student.interests.length > 3 && (
                            <span className="px-2 py-1 text-xs text-muted-foreground">
                              +{student.interests.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {student.resumeUrl ? (
                          <span className="text-xs font-medium text-primary hover:underline cursor-pointer flex items-center gap-1" onClick={() => window.open(student.resumeUrl, '_blank')}>
                            <FileText className="w-3 h-3" /> View
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {student.transcriptUrl ? (
                          <span className="text-xs font-medium text-primary hover:underline cursor-pointer flex items-center gap-1" onClick={() => window.open(student.transcriptUrl, '_blank')}>
                            <FileText className="w-3 h-3" /> View
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
