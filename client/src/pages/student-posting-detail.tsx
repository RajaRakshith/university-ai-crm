import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Calendar, User, Mail, FileText, Heart, Bookmark } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface PostingDetail {
  id: string;
  posterName: string;
  posterEmail: string;
  title: string;
  description: string;
  whoTheyNeed: string;
  createdAt: string;
}

export default function StudentPostingDetail() {
  const [, params] = useRoute("/student/posting/:id");
  const postingId = params?.id;
  const [saved, setSaved] = useState(false);
  const [interested, setInterested] = useState(false);

  const { data: posting, isLoading, error } = useQuery<PostingDetail>({
    queryKey: ["/api/postings", postingId],
    enabled: !!postingId,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (error || !posting) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Opportunity not found.</p>
              <Link href="/student/discover">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Discover
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/student/discover">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{posting.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {posting.posterName}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(posting.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={saved ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSaved(!saved)}
                  className="gap-2"
                >
                  <Bookmark className="w-4 h-4" />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button
                  variant={interested ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInterested(!interested)}
                  className="gap-2"
                >
                  <Heart className="w-4 h-4" />
                  {interested ? "Interested" : "Express Interest"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {posting.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{posting.description}</p>
              </div>
            )}

            {posting.whoTheyNeed && (
              <div>
                <h3 className="font-semibold mb-2">Who They're Looking For</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{posting.whoTheyNeed}</p>
              </div>
            )}

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>Contact: {posting.posterEmail || "Not provided"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Link href="/student/discover">
            <Button variant="outline">Browse More Opportunities</Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
