import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Loader2, MessageSquare, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Campaign {
  id: string;
  name: string;
  postingId: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
  posting: {
    id: string;
    title: string;
    posterName: string;
  };
}

export default function StudentCampaigns() {
  const { user, profile } = useAuth();

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/students", profile?.id, "campaigns"],
    queryFn: async () => {
      if (!profile?.id) return [];
      const res = await fetch(`/api/students/${profile.id}/campaigns`, {
        credentials: "include",
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.campaigns || [];
    },
    enabled: !!profile?.id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
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
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">My Campaigns</h1>
          <p className="text-muted-foreground">
            View campaigns and opportunities sent to you via SMS
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't received any campaigns yet. Organizers will send you opportunities based on your profile.
              </p>
              <Link href="/student/discover">
                <Button variant="outline">Discover Opportunities</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Event</p>
                    <p className="text-sm">{campaign.posting.title}</p>
                  </div>
                  {campaign.sentAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Sent {new Date(campaign.sentAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <Link href={`/student/posting/${campaign.postingId}`}>
                    <Button variant="outline" className="w-full gap-2">
                      View Details
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
