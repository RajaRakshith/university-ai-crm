import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, Megaphone } from "lucide-react";
import { Link } from "wouter";

const MOCK_CAMPAIGNS = [
  { id: "1", name: "AI Mixer Invite", event: "AI & Tech Mixer", status: "Sent", type: "Initial Invite", date: "Oct 1, 2024", performance: "68% Open" },
  { id: "2", name: "Career Fair Reminder", event: "Startup Career Fair", status: "Scheduled", type: "Re-targeting", date: "Oct 18, 2024", performance: "-" },
  { id: "3", name: "Case Comp Launch", event: "Sustainable Consulting Case Comp", status: "Draft", type: "Initial Invite", date: "-", performance: "-" },
];

export default function Campaigns() {
  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Campaigns</h1>
            <p className="text-muted-foreground">Manage and track your outreach campaigns.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="gap-2"><Filter className="w-4 h-4"/> Filter</Button>
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
              />
            </div>
          </div>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 text-muted-foreground border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Campaign Name</th>
                  <th className="px-6 py-4 font-medium">Event</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Performance</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {MOCK_CAMPAIGNS.map(campaign => (
                  <tr key={campaign.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium flex items-center gap-2 text-foreground">
                        <Megaphone className="w-4 h-4 text-muted-foreground" />
                        {campaign.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">{campaign.event}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium border border-border/50">
                        {campaign.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        campaign.status === 'Sent' ? 'bg-primary/10 text-primary border-primary/20' : 
                        campaign.status === 'Scheduled' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-muted text-muted-foreground border-border/50'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{campaign.date}</td>
                    <td className="px-6 py-4 font-medium">{campaign.performance}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}