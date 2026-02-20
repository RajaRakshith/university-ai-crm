import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, GraduationCap, Sparkles, User, LogOut } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  major?: string;
  year?: string;
  interests: Array<{
    topic: { name: string };
    weight: number;
  }>;
}

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location?: string;
  center: { name: string };
}

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const { studentId, logout } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
      fetchRecommendedEvents();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setStudent(data.student);
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    }
  };

  const fetchRecommendedEvents = async () => {
    try {
      // Use matching API to get personalized recommendations
      const response = await fetch(`/api/students/${studentId}/matches?threshold=0.3`);
      if (response.ok) {
        const data = await response.json();
        // Extract event objects from matches
        const events = data.matches.map((match: any) => match.event).filter(Boolean);
        setRecommendedEvents(events.slice(0, 3)); // Show top 3
      } else {
        // Fallback to all events if matching fails
        const fallbackResponse = await fetch(`/api/events`);
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setRecommendedEvents(fallbackData.events.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!studentId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
            <p className="text-muted-foreground mb-6">
              Create your profile to get personalized event recommendations
            </p>
            <Button onClick={() => setLocation('/student/onboard')} size="lg">
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {student?.name || 'Student'}!</h1>
              <p className="text-primary-foreground/80 mt-1">Your personalized event dashboard</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setLocation('/student/onboard')}>
                <User className="w-4 h-4 mr-2" />
                Edit Profile
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
              <CardTitle className="text-sm font-medium">Your Profile</CardTitle>
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student?.major || 'Not set'}</div>
              <p className="text-xs text-muted-foreground">{student?.year || 'Year not set'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Your Interests</CardTitle>
              <Sparkles className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student?.interests.length || 0}</div>
              <p className="text-xs text-muted-foreground">Topics matched</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recommendedEvents.length}</div>
              <p className="text-xs text-muted-foreground">Recommended for you</p>
            </CardContent>
          </Card>
        </div>

        {/* Your Interests */}
        {student && student.interests.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {student.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {interest.topic.name} ({Math.round(interest.weight * 100)}%)
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommended Events */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Recommended Events for You</h2>
            <Button variant="outline" onClick={() => setLocation('/events')}>
              View All Events
            </Button>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading recommendations...</p>
          ) : recommendedEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="text-xs text-muted-foreground mb-2">{event.center.name}</div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(event.eventDate).toLocaleDateString()}
                    </div>
                    <Button className="w-full" size="sm">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No events available yet. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
