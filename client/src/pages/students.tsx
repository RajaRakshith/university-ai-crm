import { AppLayout } from "@/components/layout";
import { MOCK_STUDENTS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, FileText, History, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Students() {
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
                  <th className="px-6 py-4 font-medium">School</th>
                  <th className="px-6 py-4 font-medium">Major</th>
                  <th className="px-6 py-4 font-medium">Degree</th>
                  <th className="px-6 py-4 font-medium">Grad Year</th>
                  <th className="px-6 py-4 font-medium">Top Interests</th>
                  <th className="px-6 py-4 font-medium">Resume</th>
                  <th className="px-6 py-4 font-medium text-right">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {MOCK_STUDENTS.map(student => (
                  <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{student.name}</div>
                    </td>
                    <td className="px-6 py-4">{student.school}</td>
                    <td className="px-6 py-4">{student.major}</td>
                    <td className="px-6 py-4">{student.degree}</td>
                    <td className="px-6 py-4">{student.year}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {student.interests.map(i => (
                          <span key={i.tag} className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border/50">
                            {i.tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-primary hover:underline cursor-pointer flex items-center gap-1" onClick={() => window.open('/resume-placeholder.pdf', '_blank')}>
                          <FileText className="w-3 h-3" /> View Resume
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                            <History className="w-4 h-4" /> View History
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Attendance History for {student.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="flex gap-4 items-start pb-4 border-b border-border/50">
                              <div className="bg-primary/10 p-2 rounded-lg text-primary mt-1">
                                <CalendarDays className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-medium">AI & Tech Mixer</h4>
                                <p className="text-sm text-muted-foreground">Attended • Oct 15, 2024</p>
                              </div>
                            </div>
                            <div className="flex gap-4 items-start pb-4 border-b border-border/50">
                              <div className="bg-primary/10 p-2 rounded-lg text-primary mt-1">
                                <CalendarDays className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-medium">Startup Career Fair</h4>
                                <p className="text-sm text-muted-foreground">RSVP'd • Oct 20, 2024</p>
                              </div>
                            </div>
                            <div className="flex gap-4 items-start pb-2">
                              <div className="bg-muted p-2 rounded-lg text-muted-foreground mt-1">
                                <CalendarDays className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="font-medium text-muted-foreground">Sustainable Consulting Case Comp</h4>
                                <p className="text-sm text-muted-foreground">Opened Email • Nov 5, 2024</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
