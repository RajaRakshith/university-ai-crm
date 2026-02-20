import { AppLayout } from "@/components/layout";
import { MOCK_EVENTS, MOCK_STUDENTS } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  ArrowLeft,
  Megaphone,
  Mail,
  UserCheck,
  Link as LinkIcon,
  FileText,
  Download,
  History
} from "lucide-react";

export default function EventDetails() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id;
  const event = MOCK_EVENTS.find(e => e.id === eventId);

  if (!event) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Event not found</h2>
          <Link href="/events">
            <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Events</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Mock campaigns for this event
  const campaigns = [
    { id: 1, name: "Initial Invite: Target Audience", sent: 120, opens: 85, clicks: 42, signups: 30, status: "Completed" },
    { id: 2, name: "Follow-up: Highly Engaged", sent: 45, opens: 38, clicks: 20, signups: 15, status: "Active" }
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px]">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link href="/events">
            <a className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 w-fit">
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </a>
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex gap-2 mb-3">
                {event.category.map(cat => (
                  <span key={cat} className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                    {cat}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">{event.name}</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Edit Details</Button>
              <Link href={`/campaigns/new?event=${event.id}`}>
                <Button className="gap-2 shadow-sm"><Megaphone className="w-4 h-4" /> New Campaign</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm border-border bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Date & Time</p>
                <p className="font-semibold">{event.date}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Location</p>
                <p className="font-semibold">Student Center</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Capacity</p>
                <p className="font-semibold">{event.signups} / {event.capacity} <span className="text-xs text-muted-foreground font-normal ml-1">registered</span></p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Details Section */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="bg-muted/10 border-b border-border/50">
            <CardTitle className="text-base">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                  <p className="text-sm leading-relaxed">{event.description || "No description provided."}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Important Links</h4>
                  <div className="space-y-2">
                    {event.url && (
                      <a href={event.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 transition-colors">
                        <LinkIcon className="w-4 h-4" /> Event Website
                      </a>
                    )}
                    {event.signupForm ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 transition-colors bg-transparent border-none p-0 cursor-pointer text-left">
                            <FileText className="w-4 h-4" /> Additional Signup Form
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Additional Info Required</DialogTitle>
                            <DialogDescription>
                              Specify what additional information students need to provide when they RSVP.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-2">
                            <div className="space-y-2">
                              <Label>Question 1</Label>
                              <Input defaultValue="Dietary Restrictions" />
                            </div>
                            <div className="space-y-2">
                              <Label>Question 2</Label>
                              <Input defaultValue="What are you hoping to learn from this event?" />
                            </div>
                            <div className="space-y-2">
                              <Label>Question 3</Label>
                              <Input placeholder="Add another question..." />
                            </div>
                            <Button variant="outline" size="sm" className="w-full mt-2 border-dashed">
                              + Add Question
                            </Button>
                          </div>
                          <DialogFooter>
                            <Button type="button">Save Form</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                        <FileText className="w-4 h-4 opacity-50" /> No external signup form required
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6">
          {/* Campaigns Table */}
          <div className="col-span-1">
            <Card className="shadow-sm border-border h-full">
              <CardHeader className="bg-muted/10 border-b border-border/50 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Linked Campaigns</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-background text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-5 py-3.5 font-medium text-xs tracking-wider uppercase">Campaign</th>
                      <th className="px-5 py-3.5 font-medium text-xs tracking-wider uppercase text-center">Sent</th>
                      <th className="px-5 py-3.5 font-medium text-xs tracking-wider uppercase text-center">Signups</th>
                      <th className="px-5 py-3.5 font-medium text-xs tracking-wider uppercase text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {campaigns.map(campaign => (
                      <tr key={campaign.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                        <td className="px-5 py-4">
                          <div className="font-medium text-foreground flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            {campaign.name}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground text-center">{campaign.sent}</td>
                        <td className="px-5 py-4 font-medium text-center">{campaign.signups}</td>
                        <td className="px-5 py-4 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${
                            campaign.status === 'Active' 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {campaigns.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">
                          No campaigns created for this event yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Recent Signups */}
          <div className="col-span-1">
            <Card className="shadow-sm border-border h-full overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/50 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  Recent Signups
                </CardTitle>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download List
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-muted/30 text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Phone</th>
                      <th className="px-6 py-4 font-medium">School</th>
                      <th className="px-6 py-4 font-medium">Major</th>
                      <th className="px-6 py-4 font-medium">Degree</th>
                      <th className="px-6 py-4 font-medium">Grad Year</th>
                      <th className="px-6 py-4 font-medium">Top Interests</th>
                      <th className="px-6 py-4 font-medium">Resume</th>
                      <th className="px-6 py-4 font-medium">Transcript</th>
                      <th className="px-6 py-4 font-medium text-right">History</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {MOCK_STUDENTS.slice(0, 5).map(student => (
                      <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{student.name}</div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{student.phone}</td>
                        <td className="px-6 py-4">{student.school}</td>
                        <td className="px-6 py-4">{student.major}</td>
                        <td className="px-6 py-4">{student.degree}</td>
                        <td className="px-6 py-4">{student.year}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 flex-wrap max-w-[200px]">
                            {student.interests.map(i => (
                              <span key={i.tag} className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border/50 truncate">
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
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-primary hover:underline cursor-pointer flex items-center gap-1" onClick={() => window.open('/transcript-placeholder.pdf', '_blank')}>
                              <FileText className="w-3 h-3" /> View Transcript
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
                <div className="p-4 border-t border-border bg-muted/10 text-center">
                  <Button variant="link" className="text-sm h-auto p-0">View all {event.signups} attendees</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}