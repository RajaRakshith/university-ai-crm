import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location?: string;
  center: {
    name: string;
  };
  topics: Array<{
    topic: {
      name: string;
    };
  }>;
}

export default function Events() {
  const { organizerId } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Filter events by logged-in organizer
        const url = organizerId 
          ? `/api/events?organizerId=${organizerId}`
          : '/api/events';
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [organizerId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Events</h1>
            <p className="text-muted-foreground">Manage your center's upcoming programs and target audiences.</p>
          </div>
          <Link href="/events/new">
            <Button className="gap-2 shadow-md"><Plus className="w-4 h-4"/> Create Event</Button>
          </Link>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search events..." 
              className="pl-9 bg-background border-border/50"
            />
          </div>
        </div>

        {events.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">Create your first event to get started</p>
            <Link href="/events/new">
              <Button>Create Event</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Card key={event.id} className="border-border/50 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                <div className="h-32 bg-muted/30 border-b border-border/30 p-6 flex flex-col justify-end relative">
                  <div className="absolute top-4 right-4 flex gap-2 flex-wrap max-w-[200px]">
                    {event.topics.slice(0, 2).map((t, i) => (
                      <span key={i} className="px-2 py-1 bg-background/80 backdrop-blur border border-border/50 rounded-full text-xs font-medium">
                        {t.topic.name}
                      </span>
                    ))}
                    {event.topics.length > 2 && (
                      <span className="px-2 py-1 bg-background/80 backdrop-blur border border-border/50 rounded-full text-xs font-medium">
                        +{event.topics.length - 2}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-heading group-hover:text-primary transition-colors">{event.title}</h3>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-foreground/70" /> 
                      {new Date(event.eventDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-foreground/70" /> 
                      {event.location || 'Location TBA'}
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-foreground/70" /> 
                      {event.center.name}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      {event.topics.length} {event.topics.length === 1 ? 'Topic' : 'Topics'}
                    </span>
                    <Link href={`/events/${event.id}`}>
                      <Button variant="secondary" size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
