import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "wouter";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  ArrowLeft,
  Megaphone,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location?: string;
  requirements?: string;
  requiredMajors?: string;
  requiredYears?: string;
  center: {
    id: string;
    name: string;
  };
  topics: Array<{
    topic: {
      name: string;
    };
    weight: number;
  }>;
}

interface MatchedStudent {
  studentId: string;
  score: number;
  matchedTopics: string[];
  student: {
    id: string;
    name: string;
    email: string;
    major?: string;
    year?: string;
  };
}

export default function EventDetails() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id;
  const [event, setEvent] = useState<Event | null>(null);
  const [matchedStudents, setMatchedStudents] = useState<MatchedStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventAndMatches = async () => {
      try {
        // Fetch event details
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          const foundEvent = data.events.find((e: Event) => e.id === eventId);
          setEvent(foundEvent || null);

          // Fetch matched students for this event
          if (foundEvent) {
            const matchResponse = await fetch(`/api/events/${eventId}/matches?threshold=0.2`);
            if (matchResponse.ok) {
              const matchData = await matchResponse.json();
              setMatchedStudents(matchData.matches || []);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) {
      fetchEventAndMatches();
    }
  }, [eventId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Event not found</h2>
          <Link href="/events">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
            </button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px]">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex gap-2 mb-3">
                {event.topics.slice(0, 3).map((t, i) => (
                  <span key={i} className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                    {t.topic.name}
                  </span>
                ))}
                {event.topics.length > 3 && (
                  <span className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">
                    +{event.topics.length - 3} more
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">{event.title}</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Edit Details</Button>
              <Link href={`/campaigns/send/${event.id}`}>
                <Button className="gap-2 shadow-sm"><Megaphone className="w-4 h-4" /> Send Campaign</Button>
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
                <p className="font-semibold">{new Date(event.eventDate).toLocaleString()}</p>
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
                <p className="font-semibold">{event.location || 'TBA'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border bg-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Center</p>
                <p className="font-semibold">{event.center.name}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>Event Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{event.description}</p>
          </CardContent>
        </Card>

        {/* Requirements */}
        {(event.requiredMajors || event.requiredYears) && (
          <Card>
            <CardHeader>
              <CardTitle>Student Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {event.requiredMajors && (
                <div>
                  <p className="text-sm font-medium mb-1">Required Majors</p>
                  <div className="flex flex-wrap gap-2">
                    {event.requiredMajors.split(',').map((major, i) => (
                      <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                        {major.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {event.requiredYears && (
                <div>
                  <p className="text-sm font-medium mb-1">Required Years</p>
                  <div className="flex flex-wrap gap-2">
                    {event.requiredYears.split(',').map((year, i) => (
                      <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                        {year.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Event Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {event.topics.map((t, i) => (
                <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                  {t.topic.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Matched Students */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Matched Students</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Students who match this event based on their interests
                </p>
              </div>
              <Link href={`/campaigns/send/${event.id}`}>
                <Button className="gap-2">
                  <Megaphone className="w-4 h-4" /> Send Campaign
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {matchedStudents.length > 0 ? (
              <div className="space-y-3">
                {matchedStudents.map((match) => (
                  <div
                    key={match.student.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{match.student.name}</h4>
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(match.score * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-primary">
                            {Math.round(match.score * 100)}% match
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{match.student.email}</span>
                        {match.student.major && <span>• {match.student.major}</span>}
                        {match.student.year && <span>• {match.student.year}</span>}
                      </div>
                      {match.matchedTopics && match.matchedTopics.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {match.matchedTopics.slice(0, 5).map((topic, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                            >
                              {topic}
                            </span>
                          ))}
                          {match.matchedTopics.length > 5 && (
                            <span className="px-2 py-0.5 text-muted-foreground text-xs">
                              +{match.matchedTopics.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No matching students found yet.</p>
                <p className="text-sm mt-1">Students will appear here as they onboard.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
