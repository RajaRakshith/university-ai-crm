import { AppLayout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="space-y-8 max-w-[1200px] animate-in fade-in duration-300">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Overview</h1>
            <p className="text-muted-foreground text-sm">Monitor campaign performance and student engagement.</p>
          </div>
          <Link href="/campaigns/new">
            <Button className="shadow-sm transition-all gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md h-9 px-4 text-sm font-medium">
              <Plus className="w-4 h-4"/> New Campaign
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Students Reached" value="12,450" change="+12%" icon={Users} />
          <MetricCard title="Active Campaigns" value="8" change="+2" icon={Target} />
          <MetricCard title="Upcoming Events" value="14" change="Next 30 days" icon={CalendarDays} />
          <MetricCard title="Avg. Conversion Rate" value="18.5%" change="+2.4%" icon={MousePointerClick} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-sm border-border bg-card rounded-xl overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-base">Recent Campaigns</h3>
            </div>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-background text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-5 py-3.5 font-medium text-xs tracking-wider uppercase">Campaign</th>
                    <th className="px-5 py-3.5 font-medium text-xs tracking-wider uppercase">Sent</th>
                    <th className="px-5 py-3.5 font-medium text-xs tracking-wider uppercase">Open Rate</th>
                    <th className="px-5 py-3.5 font-medium text-xs tracking-wider uppercase">Signups</th>
                    <th className="px-5 py-3.5 font-medium text-xs tracking-wider uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {RECENT_CAMPAIGNS.map(campaign => (
                    <tr key={campaign.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-foreground">{campaign.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{campaign.event}</div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{campaign.sent}</td>
                      <td className="px-5 py-4 text-muted-foreground">{campaign.openRate}</td>
                      <td className="px-5 py-4 font-medium">{campaign.signups}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
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
        </div>
      </div>
    </AppLayout>
  );
}

function MetricCard({ title, value, change, icon: Icon }: any) {
  return (
    <Card className="shadow-sm border-border hover:border-border/80 transition-colors bg-card rounded-xl">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-medium text-muted-foreground">{title}</h3>
          <div className="w-8 h-8 rounded-md bg-[#1a1a1a] flex items-center justify-center border border-border/50">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="text-[27px] font-bold font-mono tracking-tight mb-2">{value}</div>
        <p className="text-[11px] text-emerald-500 font-medium">
          {change} <span className="text-muted-foreground font-normal">vs last month</span>
        </p>
      </CardContent>
    </Card>
  );
}
