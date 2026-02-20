import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, Plus, Megaphone, Loader2, Send, AlertCircle, MessageSquare, Info, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";

interface Campaign {
  id: string;
  name: string;
  postingId: string;
  status: string;
  deliveryChannel: string;
  studentsTargeted: string;
  studentsSent: string;
  studentsSignedUp: string;
  createdAt: string;
  sentAt: string | null;
  posting: {
    id: string;
    title: string;
    posterName: string;
    posterEmail: string;
  };
}

export default function Campaigns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Get organizer email from first campaign (assuming all campaigns are from same organizer)
  const organizerEmail = useMemo(() => {
    return campaigns.length > 0 ? campaigns[0].posting.posterEmail : null;
  }, [campaigns]);

  // Fetch rate limit status
  const { data: rateLimit } = useQuery<{ used: number; limit: number }>({
    queryKey: ["/api/campaigns/rate-limit", organizerEmail],
    enabled: !!organizerEmail,
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/rate-limit?organizerEmail=${encodeURIComponent(organizerEmail!)}`);
      if (!res.ok) return { used: 0, limit: 100 };
      return res.json();
    },
  });

  const remainingSms = rateLimit ? rateLimit.limit - rateLimit.used : 100;
  const smsUsagePercent = rateLimit ? (rateLimit.used / rateLimit.limit) * 100 : 0;
  const isNearLimit = remainingSms < 20;
  const isAtLimit = remainingSms === 0;

  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const res = await fetch(`/api/campaigns/${campaignId}/send`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send campaign");
      }

      return res.json();
    },
    onSuccess: (data, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign sent",
        description: `Successfully sent ${data.sent} SMS messages.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to send campaign",
        description: err.message || "An error occurred.",
        variant: "destructive",
      });
    },
  });

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      campaign.name.toLowerCase().includes(query) ||
      campaign.posting.title.toLowerCase().includes(query) ||
      campaign.status.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
      case "completed":
        return "bg-primary/10 text-primary border-primary/20";
      case "scheduled":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "draft":
        return "bg-muted text-muted-foreground border-border/50";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Rate Limit Banner */}
        {rateLimit && (
          <Alert className={isAtLimit ? "border-destructive bg-destructive/10" : isNearLimit ? "border-amber-500 bg-amber-500/10" : "border-blue-500 bg-blue-500/10"}>
            <Info className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>Monthly SMS Limit</span>
              </span>
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
                <span>You have <strong>{remainingSms} SMS messages remaining</strong> this month. Each campaign uses SMS based on the number of students targeted.</span>
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

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Campaigns</h1>
            <p className="text-muted-foreground">Manage and track your SMS outreach campaigns.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Link href="/campaigns/new">
              <Button className="gap-2 shadow-md">
                <Plus className="w-4 h-4" /> Create Campaign
              </Button>
            </Link>
          </div>
        </div>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-muted/10 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                className="pl-9 bg-background border-border/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{searchQuery ? "No campaigns match your search." : "No campaigns yet. Create your first campaign to get started."}</p>
                {!searchQuery && (
                  <Link href="/campaigns/new">
                    <Button className="mt-4">Create Campaign</Button>
                  </Link>
                )}
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Campaign Name</th>
                    <th className="px-6 py-4 font-medium">Event</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Targeted</th>
                    <th className="px-6 py-4 font-medium">Sent</th>
                    <th className="px-6 py-4 font-medium">Signups</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium flex items-center gap-2 text-foreground">
                          <Megaphone className="w-4 h-4 text-muted-foreground" />
                          {campaign.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">{campaign.posting.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{campaign.studentsTargeted}</td>
                      <td className="px-6 py-4 font-medium">{campaign.studentsSent || "0"}</td>
                      <td className="px-6 py-4 font-medium">{campaign.studentsSignedUp || "0"}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(campaign.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {campaign.status === "draft" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendCampaignMutation.mutate(campaign.id)}
                              disabled={sendCampaignMutation.isPending}
                              className="gap-1"
                            >
                              {sendCampaignMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                              Send
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}