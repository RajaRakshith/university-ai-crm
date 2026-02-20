import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, TrendingUp, Plus, LogOut } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  center: { name: string };
}

export default function OrganizerDashboard() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalStudents: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const eventsResponse = await fetch('/api/events');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        const allEvents = eventsData.events || [];
        setEvents(allEvents.slice(0, 5)); // Show recent 5
        
        const upcoming = allEvents.filter((e: Event) => 
          new Date(e.eventDate) > new Date()
        ).length;

        setStats({
          totalEvents: allEvents.length,
          totalStudents: 0, // Will fetch from students API
          upcomingEvents: upcoming,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
              <p className="text-primary-foreground/80 mt-1">Manage events and track engagement</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setLocation('/events/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
              <Button variant="outline" onClick={() => {
                logout();
                setLocation('/');
              }}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Stats Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">Events created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">In database</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Button onClick={() => setLocation('/events/new')} className="w-full">
                Create Event
              </Button>
              <Button onClick={() => setLocation('/events')} variant="outline" className="w-full">
                View All Events
              </Button>
              <Button onClick={() => setLocation('/students')} variant="outline" className="w-full">
                View Students
              </Button>
              <Button onClick={() => setLocation('/analytics')} variant="outline" className="w-full">
                Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recent Events</h2>
            <Button variant="outline" onClick={() => setLocation('/events')}>
              View All
            </Button>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading events...</p>
          ) : events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">{event.center.name}</div>
                        <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(event.eventDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Button onClick={() => setLocation(`/events/${event.id}`)} size="sm">
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No events created yet</p>
                <Button onClick={() => setLocation('/events/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
