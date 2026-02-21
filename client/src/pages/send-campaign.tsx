import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocation, useRoute } from 'wouter';
import { ArrowLeft, Send, Mail, Users, Sparkles } from 'lucide-react';
import { Link } from 'wouter';

interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  location?: string;
}

interface MatchedStudent {
  student: {
    id: string;
    name: string;
    email: string;
    major?: string;
  };
  score: number;
  matchedTopics: string[];
}

export default function SendCampaign() {
  const [, params] = useRoute('/campaigns/send/:eventId');
  const [, setLocation] = useLocation();
  const eventId = params?.eventId;

  const [event, setEvent] = useState<Event | null>(null);
  const [matchedStudents, setMatchedStudents] = useState<MatchedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (eventId) {
      fetchEventAndStudents();
    }
  }, [eventId]);

  const fetchEventAndStudents = async () => {
    try {
      // Fetch event
      const eventResponse = await fetch('/api/events');
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        const foundEvent = eventData.events.find((e: Event) => e.id === eventId);
        
        if (foundEvent) {
          setEvent(foundEvent);
          setSubject(`You're invited: ${foundEvent.title}`);
          setMessage(`Hi {name},\n\nBased on your interests, we think you'd be a great fit for our upcoming event:\n\n${foundEvent.title}\n${new Date(foundEvent.eventDate).toLocaleDateString()}\n${foundEvent.location || 'Location TBA'}\n\n${foundEvent.description}\n\nWe hope to see you there!\n\nBest regards,\nEvent Team`);
        }
      }

      // Fetch matched students
      const matchResponse = await fetch(`/api/events/${eventId}/matches?threshold=0.2`);
      if (matchResponse.ok) {
        const matchData = await matchResponse.json();
        setMatchedStudents(matchData.matches || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!event || matchedStudents.length === 0) return;

    setSending(true);
    try {
      const response = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          subject,
          message,
          recipients: matchedStudents.map(m => ({
            email: m.student.email,
            name: m.student.name,
          })),
        }),
      });

      if (response.ok) {
        alert(`Campaign sent to ${matchedStudents.length} students!`);
        setLocation('/campaigns');
      } else {
        alert('Failed to send campaign. Please try again.');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Error sending campaign. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Event not found</h2>
          <Link href="/events">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
        <div>
          <Link href={`/events/${eventId}`} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Event
          </Link>
          <h1 className="text-3xl font-bold mb-2">Send Campaign</h1>
          <p className="text-muted-foreground">
            Send event invitation to {matchedStudents.length} matched student{matchedStudents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Event Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Event Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold text-xl">{event.title}</h3>
              <p className="text-sm text-muted-foreground">{event.description}</p>
              <div className="flex gap-4 text-sm text-muted-foreground pt-2">
                <span>📅 {new Date(event.eventDate).toLocaleDateString()}</span>
                {event.location && <span>📍 {event.location}</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipients */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <CardTitle className="text-lg">Recipients ({matchedStudents.length})</CardTitle>
              </div>
              <span className="text-sm text-muted-foreground">
                Showing top matches
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {matchedStudents.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {matchedStudents.slice(0, 10).map((match) => (
                  <div
                    key={match.student.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{match.student.name}</div>
                      <div className="text-sm text-muted-foreground">{match.student.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-medium text-primary">
                        {Math.round(match.score * 100)}% match
                      </div>
                      {match.matchedTopics && match.matchedTopics.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {match.matchedTopics.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {matchedStudents.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    + {matchedStudents.length - 10} more students
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No matching students found for this event.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Email Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              <CardTitle className="text-lg">Email Content</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <p className="text-xs text-muted-foreground mb-1.5">
                Use {'{name}'} to personalize the email with the student's name
              </p>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Email message"
                rows={12}
                className="mt-1.5 font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center pb-8">
          <Link href={`/events/${eventId}`}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </Link>
          <Button
            onClick={handleSendCampaign}
            disabled={sending || matchedStudents.length === 0 || !subject || !message}
            size="lg"
            className="gap-2"
          >
            {sending ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to {matchedStudents.length} Student{matchedStudents.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
