import { AppLayout } from "@/components/layout";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  CalendarDays,
  Target,
  AlignLeft,
  Send,
  Users,
  MessageSquare,
  Loader2,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface PostingListItem {
  id: string;
  title: string;
  posterName: string;
  createdAt: string;
}

interface MatchItem {
  id: string;
  name: string | null;
  email: string | null;
  topics: string[];
  score: number;
}

interface StudentWithPhone {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  topics: string[];
}

interface PostingDetail {
  id: string;
  title: string;
  posterName: string;
  posterEmail: string;
  description: string;
}

const STEPS = [
  { id: "event", title: "Select Event", icon: CalendarDays },
  { id: "targeting", title: "Target Students", icon: Target },
  { id: "message", title: "Compose Message", icon: AlignLeft },
];

export default function CampaignBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [campaignName, setCampaignName] = useState("");
  const [messageTemplate, setMessageTemplate] = useState("Hi {firstName}! We noticed your interest in {matchReason}. Check out {eventName} - it might be perfect for you!");
  const [minScore, setMinScore] = useState(0.7);

  // Parse URL parameters for event and pre-selected students
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventParam = urlParams.get("event");
    const studentsParam = urlParams.get("students");

    if (eventParam) {
      setSelectedEvent(eventParam);
      if (studentsParam) {
        const studentIds = studentsParam.split(",").filter(Boolean);
        setSelectedStudentIds(new Set(studentIds));
        setCurrentStep(1); // Jump to targeting step
      }
    }
  }, []);

  // Fetch postings from API
  const { data: postings = [] } = useQuery<PostingListItem[]>({
    queryKey: ["/api/postings"],
  });

  // Fetch selected posting details
  const { data: postingDetail } = useQuery<PostingDetail>({
    queryKey: ["/api/postings", selectedEvent],
    enabled: !!selectedEvent,
  });

  // Fetch matches for selected posting
  const { data: matchData, isLoading: matchLoading } = useQuery<{ matches: MatchItem[] }>({
    queryKey: ["/api/postings", selectedEvent, "match"],
    enabled: !!selectedEvent,
  });

  // Fetch all students to check phone numbers
  const { data: allStudents = [] } = useQuery<StudentWithPhone[]>({
    queryKey: ["/api/students"],
  });

  // Create a map of student IDs to phone numbers
  const studentPhoneMap = useMemo(() => {
    const map = new Map<string, boolean>();
    allStudents.forEach((student) => {
      map.set(student.id, !!(student.phoneNumber && student.phoneNumber.trim().length > 0));
    });
    return map;
  }, [allStudents]);

  // Filter high matches and only show students with phone numbers
  const highMatches = useMemo(() => {
    if (!matchData?.matches) return [];
    return matchData.matches
      .filter((m) => m.score >= minScore)
      .filter((m) => studentPhoneMap.get(m.id) === true); // Only show students with phone numbers
  }, [matchData?.matches, minScore, studentPhoneMap]);

  // Get rate limit status
  const { data: rateLimit } = useQuery<{ used: number; limit: number }>({
    queryKey: ["/api/campaigns/rate-limit", postingDetail?.posterEmail],
    enabled: !!postingDetail?.posterEmail,
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/rate-limit?organizerEmail=${encodeURIComponent(postingDetail!.posterEmail)}`);
      if (!res.ok) return { used: 0, limit: 100 };
      return res.json();
    },
  });

  // Calculate SMS count
  const smsCount = useMemo(() => {
    if (!messageTemplate) return 0;
    return Math.ceil(messageTemplate.length / 160);
  }, [messageTemplate]);

  // Calculate total SMS needed
  const totalSmsNeeded = selectedStudentIds.size * smsCount;

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async () => {
      const campaignNameValue = campaignName.trim() || `${postingDetail?.title} Campaign`;
      
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: campaignNameValue,
          postingId: selectedEvent,
          personalizedMessage: messageTemplate.trim(),
          studentIds: Array.from(selectedStudentIds),
          deliveryChannel: "sms",
        }),
        credentials: "include",
      });

      if (!res.ok) {
        // Try to parse as JSON, but handle HTML responses
        const contentType = res.headers.get("content-type");
        let errorMessage = "Failed to create campaign";
        
        if (contentType && contentType.includes("application/json")) {
          try {
            const error = await res.json();
            errorMessage = error.error || error.message || errorMessage;
            // Include additional context if available
            if (error.selectedCount !== undefined) {
              errorMessage += ` (${error.selectedCount} students selected, but none have phone numbers)`;
            }
          } catch (parseErr) {
            errorMessage = `Server error (${res.status}): Failed to parse error response`;
          }
        } else {
          // If it's HTML, we got an error page
          const text = await res.text();
          console.error("Server returned HTML instead of JSON:", text.substring(0, 500));
          errorMessage = `Server error (${res.status}): Expected JSON but received HTML. Check server logs for details.`;
        }
        
        throw new Error(errorMessage);
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully.",
      });
      setLocation("/campaigns");
    },
    onError: (err: any) => {
      console.error("Campaign creation error:", err);
      toast({
        title: "Failed to create campaign",
        description: err.message || "An error occurred. Please ensure at least one selected student has a phone number.",
        variant: "destructive",
      });
    },
  });

  const StepIcon = STEPS[currentStep].icon;
  const nextStep = () => {
    // Validate before moving to next step
    if (currentStep === 1) {
      // Step 2: Targeting - require at least one student selected
      if (selectedStudentIds.size === 0) {
        toast({
          title: "No students selected",
          description: "Please select at least one student to continue.",
          variant: "destructive",
        });
        return;
      }
    }
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

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
      setSelectedStudentIds(new Set(highMatches.map((m) => m.id)));
    }
  };

  const handleCreateCampaign = () => {
    if (selectedStudentIds.size === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student to target.",
        variant: "destructive",
      });
      return;
    }

    if (!messageTemplate.trim()) {
      toast({
        title: "Message required",
        description: "Please compose a message for your campaign.",
        variant: "destructive",
      });
      return;
    }

    createCampaignMutation.mutate();
  };

  // Preview message with sample data
  const previewMessage = useMemo(() => {
    if (!messageTemplate || highMatches.length === 0) return messageTemplate;
    const sample = highMatches[0];
    const firstName = sample.name?.split(" ")[0] || "there";
    const matchReason = sample.topics[0] || "your interests";
    const eventName = postingDetail?.title || "{eventName}";
    return messageTemplate
      .replace(/\{firstName\}/g, firstName)
      .replace(/\{matchReason\}/g, matchReason)
      .replace(/\{eventName\}/g, eventName);
  }, [messageTemplate, highMatches, postingDetail]);

  // Calculate remaining SMS
  const remainingSms = rateLimit ? rateLimit.limit - rateLimit.used : 100;
  const smsUsagePercent = rateLimit ? (rateLimit.used / rateLimit.limit) * 100 : 0;
  const isNearLimit = remainingSms < 20;
  const isAtLimit = remainingSms === 0;

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Rate Limit Banner */}
        {rateLimit && (
          <Alert className={isAtLimit ? "border-destructive bg-destructive/10" : isNearLimit ? "border-amber-500 bg-amber-500/10" : "border-blue-500 bg-blue-500/10"}>
            <Info className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between">
              <span>SMS Monthly Limit</span>
              <span className={`font-mono text-lg ${isAtLimit ? "text-destructive" : isNearLimit ? "text-amber-600" : "text-blue-600"}`}>
                {rateLimit.used} / {rateLimit.limit}
              </span>
            </AlertTitle>
            <AlertDescription>
              {isAtLimit ? (
                <span className="text-destructive font-medium">You've reached your monthly limit of {rateLimit.limit} SMS messages. You'll be able to send more next month.</span>
              ) : isNearLimit ? (
                <span className="text-amber-600">You have <strong>{remainingSms} SMS messages remaining</strong> this month. Use them wisely!</span>
              ) : (
                <span>You have <strong>{remainingSms} SMS messages remaining</strong> this month. Each campaign will use SMS based on the number of students targeted.</span>
              )}
              <div className="mt-2 w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isAtLimit ? "bg-destructive" : isNearLimit ? "bg-amber-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(smsUsagePercent, 100)}%` }}
                />
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Header & Stepper */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight mb-2 flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <StepIcon className="w-6 h-6" />
              </div>
              {STEPS[currentStep].title}
            </h1>
            <p className="text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center group">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    index === currentStep
                      ? "bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20 scale-110"
                      : index < currentStep
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                        : "bg-muted text-muted-foreground border-2 border-transparent"
                  }`}
                  onClick={index < currentStep ? () => setCurrentStep(index) : undefined}
                  title={step.title}
                >
                  {index < currentStep ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className={`w-4 h-4 ${index === currentStep ? "animate-pulse" : ""}`} />}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-10 h-1 mx-2 rounded-full transition-colors duration-300 ${index < currentStep ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          {/* Step 1: Select Event */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-xl font-medium mb-2">Which event are you recruiting for?</h3>
                <p className="text-sm text-muted-foreground">Select a posting/event to create a campaign for.</p>
              </div>

              <div className="grid gap-4">
                {postings.map((posting) => (
                  <Card
                    key={posting.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      selectedEvent === posting.id ? "border-primary ring-1 ring-primary shadow-md" : "border-border/50 shadow-sm"
                    }`}
                    onClick={() => setSelectedEvent(posting.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{posting.title}</h4>
                          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-4 h-4" /> {new Date(posting.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <span>Posted by {posting.posterName}</span>
                          </div>
                        </div>
                        {selectedEvent === posting.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Target Students */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-medium mb-2">Target High-Matching Students</h3>
                  <p className="text-sm text-muted-foreground">
                    Students are ranked by match score. Only students with phone numbers are shown below.
                  </p>
                  {matchData?.matches && matchData.matches.filter((m) => m.score >= minScore).length > highMatches.length && (
                    <p className="text-xs text-amber-600 mt-1">
                      {matchData.matches.filter((m) => m.score >= minScore).length - highMatches.length} matching student(s) hidden (no phone number)
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Min Score:</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={minScore}
                    onChange={(e) => setMinScore(parseFloat(e.target.value) || 0.7)}
                    className="w-20"
                  />
                </div>
              </div>

              {matchLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : highMatches.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-12 text-center text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium mb-2">No students available for SMS campaigns</p>
                    <p className="text-sm">
                      {matchData?.matches && matchData.matches.filter((m) => m.score >= minScore).length > 0
                        ? "No matching students have phone numbers. Students need to add their phone numbers to their profiles to receive SMS notifications."
                        : "No high-matching students found. Try lowering the minimum score threshold."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                        {selectedStudentIds.size === highMatches.length ? "Deselect All" : "Select All"}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {selectedStudentIds.size} of {highMatches.length} selected
                      </span>
                      {selectedStudentIds.size === 0 && (
                        <span className="text-sm text-amber-600 font-medium">Select at least one student to continue</span>
                      )}
                    </div>
                    {rateLimit && (
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">This campaign will use:</span>
                        <span className={`font-medium ${totalSmsNeeded > remainingSms ? "text-destructive" : "text-foreground"}`}>
                          {totalSmsNeeded} SMS
                        </span>
                        {totalSmsNeeded > remainingSms && (
                          <span className="text-xs text-destructive">(exceeds remaining {remainingSms})</span>
                        )}
                      </div>
                    )}
                  </div>

                  <Card className="border-border/50 shadow-sm overflow-hidden">
                    <div className="p-0 overflow-auto max-h-[500px]">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/30 text-muted-foreground sticky top-0 backdrop-blur-md">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium w-12">
                              <Checkbox
                                checked={selectedStudentIds.size === highMatches.length && highMatches.length > 0}
                                onCheckedChange={toggleSelectAll}
                              />
                            </th>
                            <th className="px-4 py-3 text-left font-medium">Student</th>
                            <th className="px-4 py-3 text-left font-medium">Topics</th>
                            <th className="px-4 py-3 text-left font-medium">Match Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {highMatches.map((student) => (
                            <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                              <td className="px-4 py-3">
                                <Checkbox
                                  checked={selectedStudentIds.has(student.id)}
                                  onCheckedChange={() => toggleStudentSelection(student.id)}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium">{student.name || "—"}</div>
                                <div className="text-xs text-muted-foreground">{student.email || ""}</div>
                                <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  Has phone number
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1 flex-wrap max-w-[200px]">
                                  {student.topics.slice(0, 3).map((t) => (
                                    <span key={t} className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-xs capitalize">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden max-w-[80px]">
                                    <div
                                      className={`h-full ${
                                        student.score >= 0.7 ? "bg-green-500" : student.score >= 0.4 ? "bg-yellow-500" : "bg-gray-400"
                                      }`}
                                      style={{ width: `${Math.round(student.score * 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-mono">{(student.score * 100).toFixed(0)}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              )}
            </div>
          )}

          {/* Step 3: Compose Message */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium mb-2">Compose Your SMS Message</h3>
                  <p className="text-sm text-muted-foreground">
                    Write a personalized message. Use variables to customize for each student.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="campaignName">Campaign Name</Label>
                    <Input
                      id="campaignName"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder={`${postingDetail?.title} Campaign`}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="message">Message Template</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMessageTemplate((prev) => prev + "{firstName}")}
                        >
                          {"{firstName}"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMessageTemplate((prev) => prev + "{eventName}")}
                        >
                          {"{eventName}"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMessageTemplate((prev) => prev + "{matchReason}")}
                        >
                          {"{matchReason}"}
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      id="message"
                      value={messageTemplate}
                      onChange={(e) => setMessageTemplate(e.target.value)}
                      className="min-h-[150px] font-mono text-sm"
                      placeholder="Hi {firstName}! We noticed your interest in {matchReason}. Check out {eventName}!"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{messageTemplate.length} characters</span>
                      <span>{smsCount} SMS per student</span>
                    </div>
                  </div>

                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Available Variables
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                        <li>
                          <code className="bg-background px-1 rounded">{"{firstName}"}</code> - Student's first name
                        </li>
                        <li>
                          <code className="bg-background px-1 rounded">{"{eventName}"}</code> - Event/posting title
                        </li>
                        <li>
                          <code className="bg-background px-1 rounded">{"{matchReason}"}</code> - Top matching topic
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {rateLimit && (
                    <Card className={`border ${totalSmsNeeded > remainingSms ? "border-destructive bg-destructive/5" : "border-border/50"}`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">SMS Usage for This Campaign</span>
                          </div>
                          <span className={`text-lg font-mono font-bold ${totalSmsNeeded > remainingSms ? "text-destructive" : "text-primary"}`}>
                            {totalSmsNeeded} SMS
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Current usage this month:</span>
                            <span className="font-medium">{rateLimit.used} / {rateLimit.limit}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">After this campaign:</span>
                            <span className={`font-medium ${totalSmsNeeded > remainingSms ? "text-destructive" : "text-foreground"}`}>
                              {rateLimit.used + totalSmsNeeded} / {rateLimit.limit}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Remaining after campaign:</span>
                            <span className={`font-medium ${totalSmsNeeded > remainingSms ? "text-destructive" : "text-green-600"}`}>
                              {Math.max(0, remainingSms - totalSmsNeeded)} SMS
                            </span>
                          </div>
                        </div>
                        {totalSmsNeeded > remainingSms && (
                          <Alert variant="destructive" className="mt-3">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Limit Exceeded</AlertTitle>
                            <AlertDescription>
                              This campaign requires {totalSmsNeeded} SMS, but you only have {remainingSms} remaining this month. 
                              Please reduce the number of students or wait until next month.
                            </AlertDescription>
                          </Alert>
                        )}
                        {totalSmsNeeded <= remainingSms && totalSmsNeeded > remainingSms * 0.8 && (
                          <Alert className="mt-3 border-amber-500 bg-amber-500/10">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="text-amber-600">Approaching Limit</AlertTitle>
                            <AlertDescription className="text-amber-600">
                              This campaign will use {totalSmsNeeded} of your remaining {remainingSms} SMS messages.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Message Preview</Label>
                  <Card className="border-border/50 bg-muted/20">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Sample message:</div>
                        <div className="bg-background rounded-lg p-3 text-sm whitespace-pre-wrap border border-border/50">
                          {previewMessage || "Your message preview will appear here..."}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          This message will be personalized for each student.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="text-sm font-medium">Campaign Summary</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Event:</span>
                        <span className="font-medium">{postingDetail?.title || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Students:</span>
                        <span className="font-medium">{selectedStudentIds.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total SMS:</span>
                        <span className="font-medium">{totalSmsNeeded}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-6 border-t border-border/50">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 0} className="w-32">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button 
              onClick={nextStep} 
              className="w-32 shadow-md hover:shadow-lg transition-all" 
              disabled={
                (currentStep === 0 && !selectedEvent) || 
                (currentStep === 1 && selectedStudentIds.size === 0)
              }
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreateCampaign}
              className="w-40 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all"
              disabled={createCampaignMutation.isPending || selectedStudentIds.size === 0 || !messageTemplate.trim()}
            >
              {createCampaignMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  Create Campaign <Send className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
