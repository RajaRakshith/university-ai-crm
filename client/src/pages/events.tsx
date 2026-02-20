import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Calendar, MapPin, Users, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface PostingListItem {
  id: string;
  title: string;
  posterName: string;
  createdAt: string;
}

export default function Events() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");

  const { data: allPostings = [], isLoading: isLoadingAll, isError: isAllError } = useQuery<PostingListItem[]>({
    queryKey: ["/api/postings"],
    queryFn: async () => {
      const res = await fetch("/api/postings", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `Failed to load events (${res.status})`);
      }
      return res.json();
    },
    enabled: activeTab === "all",
  });

  const { data: myPostings = [], isLoading: isLoadingMy, isError: isMyError } = useQuery<PostingListItem[]>({
    queryKey: ["/api/postings/my-events"],
    queryFn: async () => {
      const res = await fetch("/api/postings/my-events", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `Failed to load my events (${res.status})`);
      }
      return res.json();
    },
    enabled: activeTab === "my" && user?.role === "organizer",
  });

  const isLoading = activeTab === "all" ? isLoadingAll : isLoadingMy;
  const hasError = activeTab === "all" ? isAllError : isMyError;
  const postings = activeTab === "all" ? allPostings : myPostings;

  const allEvents = (Array.isArray(postings) ? postings : []).map((p) => ({
    id: p.id,
    name: p.title ?? "Untitled",
    date: (p.createdAt ? new Date(p.createdAt) : new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    capacity: 0,
    signups: 0,
    category: [] as string[],
    posterName: p.posterName ?? "",
    isPosting: true,
  }));

  const filtered = allEvents.filter((e: { name: string }) => {
    if (!searchQuery.trim()) return true;
    return e.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Events</h1>
            <p className="text-muted-foreground">Manage your center's upcoming programs and target audiences.</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md"><Plus className="w-4 h-4"/> Create Event</Button>
            </DialogTrigger>
            <PostingCreateDialog
              onSuccess={() => {
                setCreateOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/postings"] });
                queryClient.invalidateQueries({ queryKey: ["/api/postings/my-events"] });
                toast({ title: "Event created", description: "Posting created and topics extracted." });
              }}
              onError={(msg) => {
                toast({ title: "Creation failed", description: msg, variant: "destructive" });
              }}
            />
          </Dialog>
        </div>

        {user?.role === "organizer" && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "my")} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="my">My Events</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9 bg-background border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="text-sm text-muted-foreground">{filtered.length} events</span>
        </div>

        {hasError ? (
          <div className="flex flex-col items-center justify-center p-12 gap-4 text-center">
            <p className="text-muted-foreground">Could not load events. You may need to sign in again.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { queryClient.invalidateQueries({ queryKey: ["/api/postings"] }); queryClient.invalidateQueries({ queryKey: ["/api/postings/my-events"] }); }}>
                Retry
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/auth/login?role=organizer">Sign in</Link>
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => (
              <Card key={event.id} className="border-border/50 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                <div className="h-32 bg-muted/30 border-b border-border/30 p-6 flex flex-col justify-end relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    {"category" in event && (event as any).category?.map?.((cat: string) => (
                      <span key={cat} className="px-2 py-1 bg-background/80 backdrop-blur border border-border/50 rounded-full text-xs font-medium">
                        {cat}
                      </span>
                    ))}
                    {event.isPosting && (
                      <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium">
                        Posting
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold font-heading group-hover:text-primary transition-colors">{event.name}</h3>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-foreground/70" /> {event.date}
                    </div>
                    {event.posterName && (
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-foreground/70" /> Posted by: {event.posterName}
                      </div>
                    )}
                    {!event.isPosting && (
                      <>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-foreground/70" /> Student Center
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-foreground/70" /> Capacity: {event.capacity}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-4 h-4 flex items-center justify-center text-foreground/70 text-[10px] font-bold">✓</span>
                          Signups: {event.signups}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground">
                      {event.isPosting ? "View Matches" : "0 Campaigns"}
                    </span>
                    <Link href={`/events/${event.id}`}>
                      <Button variant="secondary" size="sm">Manage</Button>
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

function PostingCreateDialog({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posterName, setPosterName] = useState("");
  const [posterEmail, setPosterEmail] = useState("");
  const [whoTheyNeed, setWhoTheyNeed] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      onError("Title is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      if (posterName) formData.append("posterName", posterName);
      if (posterEmail) formData.append("posterEmail", posterEmail);
      if (description) formData.append("description", description);
      if (whoTheyNeed) formData.append("whoTheyNeed", whoTheyNeed);
      if (pdfFile) formData.append("pdf", pdfFile);

      const res = await fetch("/api/postings", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Creation failed" }));
        throw new Error(body.error || "Creation failed");
      }

      onSuccess();
    } catch (err: any) {
      onError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Create Event / Posting</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label>Title *</Label>
          <Input placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Poster Name</Label>
            <Input placeholder="Your name" value={posterName} onChange={(e) => setPosterName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Poster Email</Label>
            <Input placeholder="your@email.com" value={posterEmail} onChange={(e) => setPosterEmail(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea placeholder="Describe the event..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[80px]" />
        </div>
        <div className="space-y-2">
          <Label>Who They Need</Label>
          <Input placeholder="e.g., Python developers, ML researchers" value={whoTheyNeed} onChange={(e) => setWhoTheyNeed(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Optional PDF</Label>
          <Input type="file" accept=".pdf,.txt" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {isSubmitting ? "Creating..." : "Create Event"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
