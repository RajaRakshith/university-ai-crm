import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useRoute } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  MapPin,
  Users,
  ArrowLeft,
  Megaphone,
  Mail,
  UserCheck,
  Filter,
  X,
  Link as LinkIcon,
  FileText,
  Download,
  Loader2,
  Target,
  CheckSquare,
  Square,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

interface PostingDetail {
  id: string;
  posterName: string;
  posterEmail: string;
  title: string;
  description: string;
  whoTheyNeed: string;
  createdAt: string;
}

interface MatchItem {
  id: string;
  name: string | null;
  email: string | null;
  topics: string[];
  score: number;
}

export default function EventDetails() {
  const [, params] = useRoute("/events/:id");
  const [, setLocation] = useLocation();
  const eventId = params?.id;
  const [selectedStudent, setSelectedStudent] = useState<MatchItem | null>(null);
  const [minScore, setMinScore] = useState(0);
  const [topicFilter, setTopicFilter] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Try to fetch as a posting from API
  const { data: posting, isLoading: postingLoading } = useQuery<PostingDetail>({
    queryKey: ["/api/postings", eventId],
    enabled: !!eventId,
  });

  // Fetch matches if it's a posting
  const { data: matchData, isLoading: matchLoading } = useQuery<{ matches: MatchItem[] }>({
    queryKey: ["/api/postings", eventId, "match"],
    enabled: !!eventId && !!posting,
  });

  const filteredMatches = useMemo(() => {
    if (!matchData?.matches) return [];
    return matchData.matches.filter((m) => {
      if (m.score < minScore) return false;
      if (topicFilter && !m.topics.some((t) => t.toLowerCase().includes(topicFilter.toLowerCase()))) {
        return false;
      }
      return true;
    });
  }, [matchData?.matches, minScore, topicFilter]);

  // Filter high matches (score >= 0.7)
  const highMatches = useMemo(() => {
    return filteredMatches.filter(m => m.score >= 0.7);
  }, [filteredMatches]);

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudentIds);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudentIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.size === highMatches.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(highMatches.map(m => m.id)));
    }
  };

  const handleCreateCampaign = () => {
    // Navigate to campaign builder with selected students
    const studentIds = Array.from(selectedStudentIds);
    const queryParams = new URLSearchParams({
      event: eventId || "",
      students: studentIds.join(","),
    });
    setLocation(`/campaigns/new?${queryParams.toString()}`);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 0.7) return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">High Match</Badge>;
    if (score >= 0.4) return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Medium Match</Badge>;
    return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Low Match</Badge>;
  };

  const isPosting = !!posting;
  const isLoading = postingLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!posting) {
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

  // If it's an API posting, render posting detail view with matches
  if (isPosting && posting) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px]">
          <div className="flex flex-col gap-4">
            <Link href="/events">
              <a className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 w-fit">
                <ArrowLeft className="w-4 h-4" /> Back to Events
              </a>
            </Link>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">{posting.title}</h1>
                <p className="text-muted-foreground">Posted by {posting.posterName}{posting.posterEmail ? ` (${posting.posterEmail})` : ""}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/campaigns/new?event=${posting.id}`}>
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
                  <p className="text-sm text-muted-foreground font-medium">Created</p>
                  <p className="font-semibold">{new Date(posting.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border bg-card">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Who They Need</p>
                  <p className="font-semibold">{posting.whoTheyNeed || "Not specified"}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border bg-card">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Matched Students</p>
                  <p className="font-semibold">{matchData?.matches?.length ?? 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {posting.description && (
            <Card className="shadow-sm border-border bg-card">
              <CardHeader className="bg-muted/10 border-b border-border/50">
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{posting.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Campaign Creation for High Matches */}
          {highMatches.length > 0 && (
            <Card className="shadow-sm border-border bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Create Campaign from High Matches</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudentIds.size > 0 
                        ? `${selectedStudentIds.size} student${selectedStudentIds.size === 1 ? '' : 's'} selected`
                        : `${highMatches.length} high-quality matches available`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                      className="gap-2"
                    >
                      {selectedStudentIds.size === highMatches.length ? (
                        <>
                          <CheckSquare className="w-4 h-4" />
                          Deselect All
                        </>
                      ) : (
                        <>
                          <Square className="w-4 h-4" />
                          Select All High Matches
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCreateCampaign}
                      disabled={selectedStudentIds.size === 0}
                      className="gap-2"
                    >
                      <Megaphone className="w-4 h-4" />
                      Create Campaign ({selectedStudentIds.size || 0})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Matched Students */}
          <Card className="shadow-sm border-border h-full overflow-hidden">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  Matched Students ({filteredMatches.length} of {matchData?.matches?.length || 0})
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="minScore" className="text-xs text-muted-foreground whitespace-nowrap">Min Score:</Label>
                    <Input
                      id="minScore"
                      type="number"
                      min="0"
                      max="100"
                      step="10"
                      value={Math.round(minScore * 100)}
                      onChange={(e) => setMinScore(parseInt(e.target.value) / 100)}
                      className="w-20 h-8 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Filter by topic..."
                      value={topicFilter}
                      onChange={(e) => setTopicFilter(e.target.value)}
                      className="w-40 h-8 text-xs"
                    />
                    {topicFilter && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTopicFilter("")}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {matchLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : !matchData?.matches?.length ? (
                <div className="p-12 text-center text-muted-foreground">
                  No matching students found. Upload student profiles first.
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No students match your filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 text-muted-foreground border-b border-border/50">
                      <tr>
                        {highMatches.length > 0 && (
                          <th className="px-6 py-4 font-medium w-12">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectAll();
                              }}
                              className="p-1 hover:bg-muted rounded"
                            >
                              {selectedStudentIds.size === highMatches.length ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                        )}
                        <th className="px-6 py-4 font-medium">Name</th>
                        <th className="px-6 py-4 font-medium">Email</th>
                        <th className="px-6 py-4 font-medium">Topics</th>
                        <th className="px-6 py-4 font-medium">Match Quality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredMatches.map((m) => {
                        const isHighMatch = m.score >= 0.7;
                        const isSelected = selectedStudentIds.has(m.id);
                        return (
                          <tr
                            key={m.id}
                            className={`hover:bg-muted/10 transition-colors ${isSelected ? 'bg-primary/5' : ''} ${isHighMatch ? 'border-l-2 border-l-primary' : ''}`}
                          >
                            {highMatches.length > 0 && (
                              <td className="px-6 py-4">
                                {isHighMatch ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleStudentSelection(m.id);
                                    }}
                                    className="p-1 hover:bg-muted rounded"
                                  >
                                    {isSelected ? (
                                      <CheckSquare className="w-4 h-4 text-primary" />
                                    ) : (
                                      <Square className="w-4 h-4" />
                                    )}
                                  </button>
                                ) : (
                                  <div className="w-4 h-4" />
                                )}
                              </td>
                            )}
                            <td 
                              className="px-6 py-4 font-medium cursor-pointer"
                              onClick={() => setSelectedStudent(m)}
                            >
                              {m.name || "—"}
                            </td>
                            <td 
                              className="px-6 py-4 text-muted-foreground cursor-pointer"
                              onClick={() => setSelectedStudent(m)}
                            >
                              {m.email || "—"}
                            </td>
                            <td 
                              className="px-6 py-4 cursor-pointer"
                              onClick={() => setSelectedStudent(m)}
                            >
                              <div className="flex gap-2 flex-wrap max-w-[300px]">
                                {m.topics.slice(0, 4).map((t) => (
                                  <Badge key={t} variant="secondary" className="text-xs capitalize">
                                    {t}
                                  </Badge>
                                ))}
                                {m.topics.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{m.topics.length - 4}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td 
                              className="px-6 py-4 cursor-pointer"
                              onClick={() => setSelectedStudent(m)}
                            >
                              <div className="flex items-center gap-2">
                                {getScoreBadge(m.score)}
                                <div className="w-24 bg-secondary h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all ${
                                      m.score >= 0.7 ? 'bg-green-500' : 
                                      m.score >= 0.4 ? 'bg-yellow-500' : 
                                      'bg-gray-400'
                                    }`}
                                    style={{ width: `${Math.round(m.score * 100)}%` }} 
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Detail Dialog */}
          <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Student Profile</DialogTitle>
              </DialogHeader>
              {selectedStudent && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="font-medium">{selectedStudent.name || "—"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="font-medium">{selectedStudent.email || "—"}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Match Quality</Label>
                    <div className="flex items-center gap-3">
                      {getScoreBadge(selectedStudent.score)}
                      <div className="w-32 bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            selectedStudent.score >= 0.7 ? 'bg-green-500' : 
                            selectedStudent.score >= 0.4 ? 'bg-yellow-500' : 
                            'bg-gray-400'
                          }`}
                          style={{ width: `${Math.round(selectedStudent.score * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Topics & Interests</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.topics.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </AppLayout>
    );
  }

  return null;
}
