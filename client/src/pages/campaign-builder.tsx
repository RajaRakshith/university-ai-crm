import { AppLayout } from "@/components/layout";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_EVENTS, MOCK_STUDENTS, INTEREST_TAGS } from "@/lib/mock-data";
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  CalendarDays,
  Target,
  Sparkles,
  AlignLeft,
  Send,
  Users
} from "lucide-react";

const STEPS = [
  { id: "event", title: "Select Event", icon: CalendarDays },
  { id: "targeting", title: "Targeting", icon: Target },
  { id: "content", title: "Content", icon: AlignLeft },
  { id: "review", title: "Review & Launch", icon: Send },
];

export default function CampaignBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(MOCK_EVENTS[0].id);
  const [targetSize, setTargetSize] = useState([100]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["AI/ML"]);

  const StepIcon = STEPS[currentStep].icon;

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const toggleInterest = (tag: string) => {
    setSelectedInterests(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
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
          
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  index === currentStep 
                    ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20" 
                    : index < currentStep 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                }`}>
                  {index < currentStep ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 h-1 mx-2 rounded-full ${index < currentStep ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          {currentStep === 0 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium">Which event are you recruiting for?</h3>
                <Button variant="outline">Create New Event</Button>
              </div>
              
              <div className="grid gap-4">
                {MOCK_EVENTS.map(event => (
                  <Card 
                    key={event.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${selectedEvent === event.id ? 'border-primary ring-1 ring-primary shadow-md' : 'border-border/50 shadow-sm'}`}
                    onClick={() => setSelectedEvent(event.id)}
                  >
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{event.name}</h4>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4"/> {event.date}</span>
                          <span className="flex items-center gap-1"><Users className="w-4 h-4"/> Capacity: {event.capacity}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {event.category.map(cat => (
                          <span key={cat} className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-4 duration-300">
              <div className="lg:col-span-5 space-y-8">
                <div>
                  <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary"/> AI Targeting
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Our system scans student resumes, club history, and courses to find the perfect matches.
                  </p>

                  <div className="space-y-6 bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                    <div>
                      <Label className="text-base">Targeting Interests</Label>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {INTEREST_TAGS.map(tag => (
                          <button
                            key={tag}
                            onClick={() => toggleInterest(tag)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                              selectedInterests.includes(tag)
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <div className="flex justify-between mb-4">
                        <Label className="text-base">Target Audience Size</Label>
                        <span className="font-mono font-medium text-primary">Top {targetSize[0]} students</span>
                      </div>
                      <Slider 
                        value={targetSize} 
                        onValueChange={setTargetSize} 
                        max={500} 
                        step={10} 
                        className="py-4"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        System predicts ~{Math.round(targetSize[0] * 0.18)} signups (18% conversion rate)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <Card className="border-border/50 shadow-sm overflow-hidden h-full flex flex-col">
                  <div className="p-4 border-b border-border/50 bg-muted/20 flex justify-between items-center">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4"/> Preview Ranked Matches
                    </h4>
                    <span className="text-sm text-muted-foreground">{MOCK_STUDENTS.length} sample records</span>
                  </div>
                  <div className="p-0 overflow-auto flex-1">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/30 text-muted-foreground sticky top-0 backdrop-blur-md">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">Student</th>
                          <th className="px-4 py-3 text-left font-medium">Match</th>
                          <th className="px-4 py-3 text-left font-medium">Inferred Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {MOCK_STUDENTS.map(student => (
                          <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium">{student.name}</div>
                              <div className="text-xs text-muted-foreground">{student.program}, '{student.year}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden max-w-[60px]">
                                  <div className="bg-primary h-full" style={{width: `${student.matchScore}%`}}/>
                                </div>
                                <span className="font-mono text-xs font-semibold">{student.matchScore}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {student.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium">Craft your message</h3>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Sparkles className="w-4 h-4" /> AI Assist
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject Line</Label>
                    <Input defaultValue={`Special Invitation: ${MOCK_EVENTS.find(e => e.id === selectedEvent)?.name}`} className="font-medium bg-background"/>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Message Body</Label>
                      <div className="flex gap-2">
                        {['{FirstName}', '{InterestTag}', '{RelevantClub}'].map(variable => (
                          <span key={variable} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors">
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Textarea 
                      className="min-h-[250px] font-sans text-sm resize-none bg-background"
                      defaultValue={`Hi {FirstName},\n\nBecause of your background in {InterestTag} and involvement with {RelevantClub}, we thought you'd be a perfect fit for our upcoming event.\n\nWe are hosting an exclusive session where you can network with industry leaders and learn about the latest trends.\n\nSpace is limited. Secure your spot below.\n\nBest,\nUniversity Center Team`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Live Preview</Label>
                <Card className="shadow-lg border-border/50 bg-background overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/40"></div>
                  <div className="p-4 border-b border-border/30 bg-muted/20 flex gap-4 text-sm">
                    <div className="font-medium w-16 text-muted-foreground">From:</div>
                    <div>University Center</div>
                  </div>
                  <div className="p-4 border-b border-border/30 bg-muted/20 flex gap-4 text-sm">
                    <div className="font-medium w-16 text-muted-foreground">Subject:</div>
                    <div className="font-semibold">Special Invitation: {MOCK_EVENTS.find(e => e.id === selectedEvent)?.name}</div>
                  </div>
                  <CardContent className="p-6 text-sm leading-relaxed space-y-4 font-sans">
                    <p>Hi Sarah,</p>
                    <p>Because of your background in <strong>AI/ML</strong> and involvement with <strong>AI Club</strong>, we thought you'd be a perfect fit for our upcoming event.</p>
                    <p>We are hosting an exclusive session where you can network with industry leaders and learn about the latest trends.</p>
                    <p>Space is limited. Secure your spot below.</p>
                    
                    <Button className="mt-4 shadow-md">RSVP Now</Button>
                    
                    <p className="text-muted-foreground pt-4">Best,<br/>University Center Team</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <Send className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-medium">Ready to Launch?</h3>
                <p className="text-muted-foreground">Review your campaign details before sending.</p>
              </div>

              <Card className="border-border/50 shadow-md">
                <CardContent className="p-0 divide-y divide-border/30">
                  <div className="flex justify-between p-6 hover:bg-muted/10 transition-colors">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Event</div>
                      <div className="font-medium text-lg">{MOCK_EVENTS.find(e => e.id === selectedEvent)?.name}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(0)}>Edit</Button>
                  </div>
                  
                  <div className="flex justify-between p-6 hover:bg-muted/10 transition-colors">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Audience</div>
                      <div className="font-medium text-lg">Top {targetSize[0]} Students</div>
                      <div className="text-sm text-primary mt-1">Matched on: {selectedInterests.join(", ")}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>Edit</Button>
                  </div>

                  <div className="flex justify-between p-6 hover:bg-muted/10 transition-colors bg-primary/5">
                    <div>
                      <div className="text-sm font-medium mb-1">Expected Outcomes</div>
                      <div className="flex items-end gap-3">
                        <span className="text-3xl font-bold font-heading">{Math.round(targetSize[0] * 0.18)}</span>
                        <span className="text-muted-foreground mb-1">estimated signups</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-6 border-t border-border/50">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 0}
            className="w-32"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={nextStep} className="w-32 shadow-md hover:shadow-lg transition-all">
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button className="w-40 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all">
              Launch Campaign <Send className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
