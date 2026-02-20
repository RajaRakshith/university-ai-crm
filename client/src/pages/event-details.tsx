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

export default function EventDetails() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          const foundEvent = data.events.find((e: Event) => e.id === eventId);
          setEvent(foundEvent || null);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) {
      fetchEvent();
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
            <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Events</Button>
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
          <Link href="/events">
            <a className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 w-fit">
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </a>
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
      </div>
    </AppLayout>
  );
}
