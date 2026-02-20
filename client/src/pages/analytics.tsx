import { AppLayout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Users, Activity, TrendingUp, AlertCircle, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Analytics() {
  const [activationFilter, setActivationFilter] = useState("active");

  const activationInsights = {
    active: {
      count: 450,
      trend: "+12%",
      description: "Highly engaged students attending 2+ events per month.",
      insight: "Leverage this group for ambassadorship programs. They have a 85% open rate on campaigns.",
      action: "Send 'Refer a Friend' campaign."
    },
    "potential-dormant": {
      count: 120,
      trend: "-5%",
      description: "Students who attended events last semester but none recently.",
      insight: "Often lose engagement due to academic workload mid-semester. They respond well to academic/career-focused events rather than social mixers.",
      action: "Retarget with 'Career Fair Prep' workshop."
    },
    dormant: {
      count: 320,
      trend: "+2%",
      description: "Students on the mailing list who haven't opened an email or attended an event in 6+ months.",
      insight: "Most of these students signed up during orientation. They need high-value, low-commitment offerings to re-engage.",
      action: "Send re-engagement 'We Miss You' survey with gift card incentive."
    }
  };

  const currentInsight = activationInsights[activationFilter as keyof typeof activationInsights];

  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px]">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Data Analytics</h1>
          <p className="text-muted-foreground">Actionable insights from student engagement data.</p>
        </div>

        <Tabs defaultValue="programs" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Program Recommendations
            </TabsTrigger>
            <TabsTrigger value="activation" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Student Activation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="programs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 shadow-sm border-border">
                <CardHeader className="bg-muted/10 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Top Recommended Programs</CardTitle>
                      <CardDescription>Based on student search trends, waitlists, and major demographics</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hidden sm:flex">
                      <TrendingUp className="w-3 h-3 mr-1" /> Updated Today
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    <div className="p-6 hover:bg-muted/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
                          "AI in Healthcare" Speaker Panel
                        </h3>
                        <Badge variant="outline">High Impact</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        We're seeing a 40% overlap between Pre-Med/Nursing students and students searching for "Tech" or "AI" events. Previous tech events had very low healthcare student turnout.
                      </p>
                      <div className="bg-muted/20 rounded-lg p-3 text-sm flex flex-col sm:flex-row gap-4">
                        <div>
                          <span className="text-muted-foreground block text-xs mb-1">Target Audience</span>
                          <span className="font-medium">Nursing, Pre-Med, CS (800+ students)</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs mb-1">Predicted Attendance</span>
                          <span className="font-medium text-emerald-500">150-200</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 hover:bg-muted/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
                          First-Gen Resume Workshop
                        </h3>
                        <Badge variant="outline">Quick Win</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Search volume for "resume" and "internship" spiked 300% among first-year and sophomore first-gen students in the last 2 weeks.
                      </p>
                      <div className="bg-muted/20 rounded-lg p-3 text-sm flex flex-col sm:flex-row gap-4">
                        <div>
                          <span className="text-muted-foreground block text-xs mb-1">Target Audience</span>
                          <span className="font-medium">First/Second Year First-Gen (450+ students)</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs mb-1">Predicted Attendance</span>
                          <span className="font-medium text-emerald-500">80-100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border">
                <CardHeader className="bg-muted/10 border-b border-border/50">
                  <CardTitle className="text-base">Trending Interests</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Tech & AI</span>
                        <span className="text-emerald-500 flex items-center"><ArrowUpRight className="w-3 h-3" /> +24%</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[85%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Consulting Prep</span>
                        <span className="text-emerald-500 flex items-center"><ArrowUpRight className="w-3 h-3" /> +15%</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[65%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Sustainability</span>
                        <span className="text-emerald-500 flex items-center"><ArrowUpRight className="w-3 h-3" /> +8%</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[45%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Social Events</span>
                        <span className="text-red-500 flex items-center">-12%</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[30%]"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-primary" />
                      Insight
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Students are shifting focus from social networking toward career-oriented skill building as midterms approach.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activation" className="space-y-6">
            <Card className="shadow-sm border-border">
              <CardHeader className="bg-muted/10 border-b border-border/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Student Activation Report</CardTitle>
                    <CardDescription>Analyze engagement levels across your student database</CardDescription>
                  </div>
                  <Select value={activationFilter} onValueChange={setActivationFilter}>
                    <SelectTrigger className="w-full md:w-[250px] bg-background">
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active (Attended recently)</SelectItem>
                      <SelectItem value="potential-dormant">Potential Dormant (At risk)</SelectItem>
                      <SelectItem value="dormant">Dormant (No recent activity)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1 border-r border-border pr-0 md:pr-8">
                    <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Segment Overview</h3>
                    <div className="text-4xl font-bold font-heading mb-2">
                      {currentInsight.count}
                      <span className="text-sm font-normal text-muted-foreground ml-2">students</span>
                    </div>
                    <div className={`text-sm font-medium mb-6 ${currentInsight.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                      {currentInsight.trend} vs last month
                    </div>
                    <p className="text-sm leading-relaxed mb-6">
                      {currentInsight.description}
                    </p>
                    <div className="bg-muted p-4 rounded-lg flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium">
                        Represents {Math.round((currentInsight.count / 890) * 100)}% of total directory
                      </span>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">AI Insight</h3>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
                        <p className="text-sm leading-relaxed">
                          {currentInsight.insight}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Recommended Action</h3>
                      <div className="border border-border rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <p className="text-sm font-medium">
                          {currentInsight.action}
                        </p>
                        <Button size="sm" className="shrink-0">Create Campaign</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
