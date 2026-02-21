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
      const response = await fetch(`/api/students/${studentId}/matches?threshold=0.2`);
      if (response.ok) {
        const data = await response.json();
        console.log('Matches response:', data);
        
        // Map matches to include event and score
        const eventsWithScores = data.matches.map((match: any) => ({
          ...match.event,
          matchScore: match.score,
          matchedTopics: match.matchedTopics
        })).filter((e: any) => e && e.id);
        
        console.log('Events with scores:', eventsWithScores);
        setRecommendedEvents(eventsWithScores); // Show all matched events
      } else {
        console.error('Failed to fetch matches:', response.status);
        // Fallback to all events if matching fails
        const fallbackResponse = await fetch(`/api/events`);
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setRecommendedEvents(fallbackData.events || []);
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

        {/* Your Top Interests */}
        {student && student.interests.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Top Interests</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Based on your resume and transcript</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {student.interests
                  .sort((a, b) => b.weight - a.weight)
                  .slice(0, 4)
                  .map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
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
            <div>
              <h2 className="text-2xl font-bold">Events Matched to Your Interests</h2>
              <p className="text-sm text-muted-foreground mt-1">Sorted by match score</p>
            </div>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading recommendations...</p>
          ) : recommendedEvents.length > 0 ? (
            <div className="space-y-4">
              {recommendedEvents.map((event: any) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {event.center?.name && (
                            <div className="text-xs text-muted-foreground">{event.center.name}</div>
                          )}
                          {event.matchScore !== undefined && (
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${Math.min(event.matchScore * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-primary">
                                {Math.round(event.matchScore * 100)}% match
                              </span>
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            {new Date(event.eventDate).toLocaleDateString()}
                          </div>
                          {event.matchedTopics && event.matchedTopics.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4" />
                              <div className="flex flex-wrap gap-1">
                                {event.matchedTopics.slice(0, 3).map((topic: string, idx: number) => (
                                  <span key={idx} className="text-xs font-medium text-primary">
                                    {topic}{idx < Math.min(event.matchedTopics.length, 3) - 1 ? ',' : ''}
                                  </span>
                                ))}
                                {event.matchedTopics.length > 3 && (
                                  <span className="text-xs font-medium text-muted-foreground">
                                    +{event.matchedTopics.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button size="sm" className="ml-4">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground font-medium mb-2">No matching events found</p>
                <p className="text-sm text-muted-foreground">
                  We'll notify you when events match your interests. Make sure your profile is complete with resume and transcript data.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
