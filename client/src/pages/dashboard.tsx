import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MousePointerClick, CalendarDays, Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const RECENT_CAMPAIGNS = [
  { id: 1, name: "AI Panel Recruitment", event: "AI in Finance", sent: 120, openRate: "45%", signups: 18, status: "Active" },
  { id: 2, name: "Consulting Case Invite", event: "Sustainable Case Comp", sent: 85, openRate: "62%", signups: 34, status: "Completed" },
  { id: 3, name: "Startup Fair Top Talent", event: "Startup Career Fair", sent: 250, openRate: "38%", signups: 42, status: "Active" },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Overview</h1>
            <p className="text-muted-foreground">Monitor campaign performance and student engagement.</p>
          </div>
          <Link href="/app/campaigns/new">
            <Button className="shadow-md transition-all gap-2">
              <Plus className="w-4 h-4"/> New Campaign
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Total Students Reached" value="12,450" change="+12%" icon={Users} />
          <MetricCard title="Active Campaigns" value="8" change="+2" icon={Target} />
          <MetricCard title="Upcoming Events" value="14" change="Next 30 days" icon={CalendarDays} />
          <MetricCard title="Avg. Conversion Rate" value="18.5%" change="+2.4%" icon={MousePointerClick} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-2 shadow-sm border-border/50">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <CardTitle>Recent Campaigns</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">Campaign</th>
                    <th className="px-4 py-3 font-medium">Sent</th>
                    <th className="px-4 py-3 font-medium">Open Rate</th>
                    <th className="px-4 py-3 font-medium">Signups</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {RECENT_CAMPAIGNS.map(campaign => (
                    <tr key={campaign.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{campaign.name}</div>
                        <div className="text-xs text-muted-foreground">{campaign.event}</div>
                      </td>
                      <td className="px-4 py-3">{campaign.sent}</td>
                      <td className="px-4 py-3">{campaign.openRate}</td>
                      <td className="px-4 py-3 font-medium">{campaign.signups}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="bg-muted/10 border-b border-border/50">
              <CardTitle>Top Interests</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { tag: "Consulting", pct: 35 },
                  { tag: "Finance", pct: 28 },
                  { tag: "AI/ML", pct: 22 },
                  { tag: "Sustainability", pct: 15 },
                ].map(interest => (
                  <div key={interest.tag} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{interest.tag}</span>
                      <span className="text-muted-foreground">{interest.pct}%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{width: `${interest.pct}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function MetricCard({ title, value, change, icon: Icon }: any) {
  return (
    <Card className="shadow-sm border-border/50 hover:border-primary/30 transition-colors bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-heading">{value}</div>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
          {change} vs last month
        </p>
      </CardContent>
    </Card>
  );
}
