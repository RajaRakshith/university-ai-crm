import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Center {
  id: string;
  name: string;
}

const CANONICAL_TOPICS = [
  'AI', 'Healthcare', 'Startups', 'Finance', 'Marketing', 'Sales',
  'Product Management', 'Engineering', 'Data Science', 'Design',
  'Sustainability', 'Education', 'Research', 'Consulting', 'Law',
  'Real Estate', 'Nonprofit', 'Social Impact', 'Sports', 'Media',
];

export default function EventCreation() {
  const [, setLocation] = useLocation();
  const [centers, setCenters] = useState<Center[]>([]);
  
  const [formData, setFormData] = useState({
    centerId: '',
    title: '',
    description: '',
    eventDate: '',
    location: '',
    requiredMajors: '',
    requiredYears: '',
  });
  
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  
  // New center dialog state
  const [showNewCenterDialog, setShowNewCenterDialog] = useState(false);
  const [newCenterData, setNewCenterData] = useState({ name: '', description: '' });
  const [creatingCenter, setCreatingCenter] = useState(false);

  // Fetch centers from API
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await fetch('/api/centers');
        if (response.ok) {
          const data = await response.json();
          setCenters(data.centers || []);
        }
      } catch (error) {
        console.error('Error fetching centers:', error);
      }
    };
    fetchCenters();
  }, []);

  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCenter(true);

    try {
      const response = await fetch('/api/centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCenterData),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to create center');
        return;
      }

      const data = await response.json();
      
      // Add new center to list and select it
      setCenters([...centers, data.center]);
      setFormData({ ...formData, centerId: data.center.id });
      
      // Reset and close dialog
      setNewCenterData({ name: '', description: '' });
      setShowNewCenterDialog(false);
    } catch (error) {
      console.error('Error creating center:', error);
      alert('Failed to create center');
    } finally {
      setCreatingCenter(false);
    }
  };

  const toggleTopic = (topic: string) => {
    const newTopics = new Set(selectedTopics);
    if (newTopics.has(topic)) {
      newTopics.delete(topic);
    } else {
      newTopics.add(topic);
    }
    setSelectedTopics(newTopics);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const topics = Array.from(selectedTopics).map((topic) => ({
        topic,
        weight: 1.0,
      }));

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          topics,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to create event');
        return;
      }

      setCreated(true);
      setTimeout(() => setLocation('/events'), 2000);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (created) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-2xl font-bold mb-2">Event Created!</h2>
              <p className="text-muted-foreground">Redirecting to events list...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setLocation('/events')}>
            ← Back to Events
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">Create New Event</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="center">Center *</Label>
                  <Dialog open={showNewCenterDialog} onOpenChange={setShowNewCenterDialog}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        + New Center
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Center</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateCenter} className="space-y-4">
                        <div>
                          <Label htmlFor="centerName">Center Name *</Label>
                          <Input
                            id="centerName"
                            value={newCenterData.name}
                            onChange={(e) => setNewCenterData({ ...newCenterData, name: e.target.value })}
                            placeholder="e.g., Innovation Hub"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="centerDescription">Description</Label>
                          <Textarea
                            id="centerDescription"
                            value={newCenterData.description}
                            onChange={(e) => setNewCenterData({ ...newCenterData, description: e.target.value })}
                            placeholder="Brief description of the center..."
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowNewCenterDialog(false);
                              setNewCenterData({ name: '', description: '' });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit" disabled={creatingCenter}>
                            {creatingCenter ? 'Creating...' : 'Create Center'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select value={formData.centerId} onValueChange={(value) => setFormData({ ...formData, centerId: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a center" />
                  </SelectTrigger>
                  <SelectContent>
                    {centers.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="AI for Healthcare Pitch Night"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe your event..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventDate">Event Date & Time *</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ross School of Business"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Requirements (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="requiredMajors">Required Majors (comma-separated)</Label>
                <Input
                  id="requiredMajors"
                  value={formData.requiredMajors}
                  onChange={(e) => setFormData({ ...formData, requiredMajors: e.target.value })}
                  placeholder="e.g., Computer Science, Engineering, Business"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Students with any of these majors will be eligible
                </p>
              </div>

              <div>
                <Label htmlFor="requiredYears">Required Years (comma-separated)</Label>
                <Input
                  id="requiredYears"
                  value={formData.requiredYears}
                  onChange={(e) => setFormData({ ...formData, requiredYears: e.target.value })}
                  placeholder="e.g., Junior, Senior, Graduate"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Only students in these years will be eligible
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Topic Tags *</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Select topics that describe this event. This helps match the right students.
              </p>

              <div className="flex flex-wrap gap-2">
                {CANONICAL_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTopics.has(topic)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {selectedTopics.size > 0 && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm">
                    Selected: <strong>{selectedTopics.size}</strong> topics
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            disabled={loading || selectedTopics.size === 0}
            className="w-full"
            size="lg"
          >
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
        </form>
      </div>
    </div>
  );
}
