import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, Sparkles, Calendar, User, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/lib/auth";

interface PostingListItem {
  id: string;
  title: string;
  posterName: string;
  createdAt: string;
}

interface PostingDetail {
  id: string;
  posterName: string;
  posterEmail: string;
  title: string;
  description: string;
  whoTheyNeed: string;
  createdAt: string;
}

interface StudentProfile {
  id: string;
  name: string | null;
  email: string | null;
  topics: string[];
  rawResumeText: string | null;
  rawTranscriptText: string | null;
  createdAt: string;
}

// Client-side topic matching (mirrors backend logic)
function computeTopicMatchScore(studentTopics: string[], postingTopics: string[]): number {
  if (postingTopics.length === 0) return 0;
  const studentLower = studentTopics.map((t) => t.toLowerCase());
  const postingLower = postingTopics.map((t) => t.toLowerCase());
  
  let matches = 0;
  for (const postingTopic of postingLower) {
    const hasMatch = studentLower.some((studentTopic) => {
      return studentTopic.includes(postingTopic) || postingTopic.includes(studentTopic);
    });
    if (hasMatch) matches++;
  }
  
  return matches / postingLower.length;
}

export default function StudentDiscover() {
  const [location] = useLocation();
  const { profile, isLoading: authLoading } = useAuth();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const urlStudentId = params.get("id");
  // Prefer URL, then localStorage, then logged-in student's profile from auth/me (set at registration)
  const storedStudentId = typeof window !== "undefined" ? localStorage.getItem("student-id") : null;
  const studentId = urlStudentId || storedStudentId || (profile?.id ?? null);
  // Persist profile id so refresh and direct navigation work
  useEffect(() => {
    if (studentId && profile?.id && studentId === profile.id && typeof window !== "undefined" && !localStorage.getItem("student-id")) {
      localStorage.setItem("student-id", studentId);
    }
  }, [studentId, profile?.id]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("foryou");

  // Fetch student profile if ID is available
  const { data: student, isLoading: studentLoading } = useQuery<StudentProfile>({
    queryKey: studentId ? ["/api/students", studentId] : ["/api/students"],
    enabled: !!studentId,
  });

  // Fetch all postings
  const { data: postings = [], isLoading } = useQuery<PostingListItem[]>({
    queryKey: ["/api/postings"],
  });

  // Fetch matches for student using the backend API
  const { data: matchData, isLoading: matchesLoading } = useQuery<{ matches: Array<{ id: string; title: string; posterName: string; topics: string[]; score: number }> }>({
    queryKey: studentId ? ["/api/students", studentId, "match"] : ["/api/students"],
    enabled: !!studentId && !!student && activeTab === "foryou",
  });

  const matchedPostings = useMemo(() => {
    if (!matchData?.matches) return [];
    // Map match results to include createdAt from postings list
    return matchData.matches.map((match) => {
      const posting = postings.find((p) => p.id === match.id);
      return {
        ...match,
        createdAt: posting?.createdAt || new Date().toISOString(),
      };
    });
  }, [matchData, postings]);

  // Filter postings for "All opportunities" tab
  const filteredPostings = useMemo(() => {
    if (!searchQuery.trim()) return postings;
    const q = searchQuery.toLowerCase();
    return postings.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.posterName.toLowerCase().includes(q)
    );
  }, [postings, searchQuery]);

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Discover Opportunities</h1>
          <p className="text-muted-foreground">
            Find research opportunities, internships, and events that match your profile
          </p>
        </div>

        {authLoading && !urlStudentId && !storedStudentId && (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your profile...</p>
            </CardContent>
          </Card>
        )}
        {!studentId && !authLoading && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                <Link href="/student/upload" className="text-primary hover:underline">
                  Create your profile
                </Link>{" "}
                to see personalized recommendations.
              </p>
            </CardContent>
          </Card>
        )}
        
        {studentId && studentLoading && (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your profile...</p>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="foryou" className="gap-2">
              <Sparkles className="w-4 h-4" />
              For You
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Search className="w-4 h-4" />
              All Opportunities
            </TabsTrigger>
          </TabsList>

          <TabsContent value="foryou" className="space-y-4">
            {isLoading || matchesLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !studentId ? (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    Create your profile to see personalized recommendations.
                  </p>
                  <Link href="/student/upload">
                    <Button>Create Profile</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : !student ? (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading your profile...</p>
                </CardContent>
              </Card>
            ) : matchedPostings.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No matches found yet. Check out all opportunities below.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {matchedPostings.map((posting) => (
                  <Card key={posting.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">{posting.title}</h3>
                            {posting.score >= 0.7 && (
                              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                High Match
                              </Badge>
                            )}
                            {posting.score >= 0.4 && posting.score < 0.7 && (
                              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                Medium Match
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {posting.posterName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(posting.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Link href={`/student/posting/${posting.id}`}>
                          <Button variant="outline" className="gap-2">
                            View Details
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  className="pl-9 bg-background border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <span className="text-sm text-muted-foreground">{filteredPostings.length} opportunities</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPostings.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    {postings.length === 0
                      ? "No opportunities available yet."
                      : "No opportunities match your search."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredPostings.map((posting) => (
                  <Card key={posting.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <h3 className="text-xl font-semibold">{posting.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {posting.posterName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(posting.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Link href={`/student/posting/${posting.id}`}>
                          <Button variant="outline" className="gap-2">
                            View Details
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
