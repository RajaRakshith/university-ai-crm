import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Users, CalendarDays, Megaphone, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function SearchResults() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q') || "";

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold font-heading tracking-tight flex items-center gap-3">
            <Search className="w-8 h-8 text-primary" />
            Search Results
          </h1>
          <p className="text-muted-foreground text-lg">
            {query ? (
              <>Showing results for <span className="font-semibold text-foreground">"{query}"</span></>
            ) : (
              "Enter a search term to find students, events, or campaigns."
            )}
          </p>
        </div>

        {query && (
          <div className="grid gap-6">
            {/* Students Results */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    Students
                  </CardTitle>
                  <CardDescription>Found 2 matching students</CardDescription>
                </div>
                <Link href="/students">
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                    View all <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {[
                    { id: "1", name: "Alex Chen", school: "Stanford University", major: "Computer Science", year: "Senior" },
                    { id: "2", name: "Sarah Johnson", school: "MIT", major: "Data Science", year: "Junior" }
                  ].map((student) => (
                    <div key={student.id} className="p-4 hover:bg-muted/10 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">{student.school} • {student.major} ({student.year})</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Profile</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Events Results */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-muted-foreground" />
                    Events
                  </CardTitle>
                  <CardDescription>Found 1 matching event</CardDescription>
                </div>
                <Link href="/events">
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                    View all <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {[
                    { id: "1", title: "AI & Tech Mixer", date: "Oct 15, 2024", location: "Stanford Campus", rsvps: 145 }
                  ].map((event) => (
                    <div key={event.id} className="p-4 hover:bg-muted/10 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-secondary flex flex-col items-center justify-center border border-border/50">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">{event.date.split(' ')[0]}</span>
                          <span className="text-sm font-bold">{event.date.split(' ')[1].replace(',', '')}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.location} • {event.rsvps} RSVPs</p>
                        </div>
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline" size="sm">Manage</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Campaigns Results */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/10 border-b border-border/50 pb-4 flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-muted-foreground" />
                    Campaigns
                  </CardTitle>
                  <CardDescription>Found 1 matching campaign</CardDescription>
                </div>
                <Link href="/campaigns">
                  <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                    View all <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {[
                    { id: "1", name: "AI Mixer Invite", type: "Initial Invite", status: "Sent", performance: "68% Open" }
                  ].map((campaign) => (
                    <div key={campaign.id} className="p-4 hover:bg-muted/10 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">{campaign.type} • {campaign.performance}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-primary/10 text-primary border-primary/20">
                        {campaign.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}