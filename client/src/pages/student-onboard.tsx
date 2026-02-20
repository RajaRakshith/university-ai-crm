import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StudentOnboard() {
  const [, setLocation] = useLocation();
  const { setStudentId: setAuthStudentId } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    major: '',
    year: '',
    resumeText: '',
    resumeUrl: '',
    transcriptText: '',
    transcriptUrl: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingTranscript, setUploadingTranscript] = useState(false);
  const [extractedInterests, setExtractedInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'resume');

      const response = await fetch('/api/students/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        resumeText: data.text,
        resumeUrl: data.url,
      }));
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleTranscriptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setTranscriptFile(file);
    setUploadingTranscript(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'transcript');

      const response = await fetch('/api/students/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload transcript');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        transcriptText: data.text,
        transcriptUrl: data.url,
      }));
    } catch (error) {
      console.error('Error uploading transcript:', error);
      alert('Failed to upload transcript. Please try again.');
    } finally {
      setUploadingTranscript(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/students/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to onboard');
        return;
      }

      const data = await response.json();
      setExtractedInterests(data.extractedInterests || []);
      setStudentId(data.student.id);
      
      // Save student ID in auth context and localStorage
      setAuthStudentId(data.student.id);
      localStorage.setItem('studentId', data.student.id);
    } catch (error) {
      console.error('Error onboarding:', error);
      alert('Failed to onboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (studentId) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">Profile Created! ✓</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground">
                We've analyzed your profile and identified your interests
              </p>
              
              {extractedInterests.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Your Interests:</h3>
                  <div className="flex flex-wrap gap-2">
                    {extractedInterests.map((interest) => (
                      <span
                        key={interest.topic}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {interest.topic} ({Math.round(interest.weight * 100)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={() => setLocation(`/student/dashboard?id=${studentId}`)}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome! Let's Get You Started</h1>
          <p className="text-muted-foreground">
            Tell us about yourself and we'll personalize opportunities for you
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@university.edu"
                  required
                />
              </div>

              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jane Smith"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="major">Major / Program</Label>
                  <Input
                    id="major"
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    placeholder="Computer Science"
                  />
                </div>

                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Freshman">Freshman</SelectItem>
                      <SelectItem value="Sophomore">Sophomore</SelectItem>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Graduate">Graduate</SelectItem>
                      <SelectItem value="MBA">MBA</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resume-file">Upload Resume (PDF, DOCX, or TXT)</Label>
                <Input
                  id="resume-file"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleResumeFileChange}
                  className="mt-1"
                />
                {uploadingResume && (
                  <p className="text-sm text-primary mt-2">Uploading and extracting text...</p>
                )}
                {resumeFile && !uploadingResume && (
                  <p className="text-sm text-green-600 mt-2">✓ {resumeFile.name} uploaded</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="resume-text">Or paste your resume text</Label>
                <Textarea
                  id="resume-text"
                  value={formData.resumeText}
                  onChange={(e) => setFormData({ ...formData, resumeText: e.target.value })}
                  rows={6}
                  placeholder="Paste your resume text here..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Transcript (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="transcript-file">Upload Transcript</Label>
                <Input
                  id="transcript-file"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleTranscriptFileChange}
                  className="mt-1"
                />
                {uploadingTranscript && (
                  <p className="text-sm text-primary mt-2">Uploading and extracting text...</p>
                )}
                {transcriptFile && !uploadingTranscript && (
                  <p className="text-sm text-green-600 mt-2">✓ {transcriptFile.name} uploaded</p>
                )}
              </div>

              <div>
                <Label htmlFor="transcript-text">Or paste your transcript</Label>
                <Textarea
                  id="transcript-text"
                  value={formData.transcriptText}
                  onChange={(e) => setFormData({ ...formData, transcriptText: e.target.value })}
                  rows={4}
                  placeholder="Paste your transcript/coursework here..."
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing...' : 'Create Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}
