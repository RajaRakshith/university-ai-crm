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
  Users,
  Clock,
  Lightbulb,
  Megaphone,
  RefreshCw,
  FileText,
  Mail,
  MessageSquare
} from "lucide-react";

const STEPS = [
  { id: "strategy", title: "Strategy", icon: Lightbulb },
  { id: "event", title: "Select Event", icon: CalendarDays },
  { id: "targeting", title: "Targeting", icon: Target },
  { id: "content", title: "Content", icon: AlignLeft },
  { id: "schedule", title: "Schedule", icon: Clock },
  { id: "review", title: "Review & Launch", icon: Send },
];

export default function CampaignBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [strategy, setStrategy] = useState("initial");
  const [retargetingAudience, setRetargetingAudience] = useState("signed-up");
  const [selectedEvent, setSelectedEvent] = useState(MOCK_EVENTS[0].id);
  const [targetSize, setTargetSize] = useState([100]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["AI/ML"]);
  
  const [selectedImage, setSelectedImage] = useState<string>("/images/preset-1.png");
  const [eventTitle, setEventTitle] = useState("AI & Tech Mixer");
  const [eventSubtitle, setEventSubtitle] = useState("Friday, October 24th @ 6:00 PM");
  const [eventDescription, setEventDescription] = useState("Join us for an exclusive session where you can network with industry leaders, learn about the latest trends in AI, and meet other students building cool things.");
  const [deliveryChannel, setDeliveryChannel] = useState("email");

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
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  index === currentStep 
                    ? "bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20 scale-110" 
                    : index < currentStep 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer" 
                      : "bg-muted text-muted-foreground border-2 border-transparent"
                }`}
                onClick={index < currentStep ? () => setCurrentStep(index) : undefined}
                title={step.title}
                >
                  {index < currentStep ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className={`w-4 h-4 ${index === currentStep ? 'animate-pulse' : ''}`} />}
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
          {currentStep === 0 && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-medium">What is the goal of this campaign?</h3>
                <p className="text-sm text-muted-foreground mt-2">Choose your campaign strategy to optimize delivery and targeting.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card 
                  className={`cursor-pointer transition-all hover:border-primary/50 ${strategy === 'initial' ? 'border-primary ring-1 ring-primary shadow-md' : 'border-border/50 shadow-sm'}`}
                  onClick={() => setStrategy('initial')}
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                      <Megaphone className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Initial Invite</h4>
                      <p className="text-sm text-muted-foreground">Reach out to a new audience to drive first-time signups and build awareness.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:border-primary/50 ${strategy === 'retargeting' ? 'border-primary ring-1 ring-primary shadow-md' : 'border-border/50 shadow-sm'}`}
                  onClick={() => setStrategy('retargeting')}
                >
                  <CardContent className="p-8 text-center space-y-4 relative">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                      <RefreshCw className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Re-targeting</h4>
                      <p className="text-sm text-muted-foreground">Follow up with students who interacted with previous campaigns.</p>
                    </div>

                    {strategy === 'retargeting' && (
                      <div className="pt-4 mt-4 border-t border-border/50 text-left animate-in slide-in-from-top-2">
                        <Label className="text-sm font-semibold mb-3 block text-center">Select Audience</Label>
                        <div className="space-y-2">
                          <label 
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${retargetingAudience === 'signed-up' ? 'bg-primary/5 border-primary/50' : 'bg-background hover:bg-muted/50 border-border/50'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRetargetingAudience('signed-up');
                            }}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${retargetingAudience === 'signed-up' ? 'border-primary' : 'border-muted-foreground'}`}>
                              {retargetingAudience === 'signed-up' && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">Previously Signed Up</div>
                              <div className="text-xs text-muted-foreground">Students who attended past events</div>
                            </div>
                          </label>
                          <label 
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${retargetingAudience === 'highly-interested' ? 'bg-primary/5 border-primary/50' : 'bg-background hover:bg-muted/50 border-border/50'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRetargetingAudience('highly-interested');
                            }}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${retargetingAudience === 'highly-interested' ? 'border-primary' : 'border-muted-foreground'}`}>
                              {retargetingAudience === 'highly-interested' && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium">Highly Interested</div>
                              <div className="text-xs text-muted-foreground">Opened emails but didn't RSVP</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 1 && (
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
                          <th className="px-4 py-3 text-left font-medium">Resume</th>
                          <th className="px-4 py-3 text-left font-medium">Match</th>
                          <th className="px-4 py-3 text-left font-medium">Inferred Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {MOCK_STUDENTS.map(student => (
                          <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium">{student.name}</div>
                              <div className="text-xs text-muted-foreground">{student.school} • {student.major} ({student.degree}), '{student.year.slice(-2)}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-primary hover:underline cursor-pointer flex items-center gap-1" onClick={() => window.open('/resume-placeholder.pdf', '_blank')}>
                                  <FileText className="w-3 h-3" /> View Resume
                                </span>
                              </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-4 duration-300">
              <div className="lg:col-span-5 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium">Design your event page</h3>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Sparkles className="w-4 h-4" /> AI Assist
                  </Button>
                </div>
                
                <div className="space-y-6 bg-card border border-border/50 rounded-xl p-5 shadow-sm">
                  <div className="space-y-3">
                    <Label className="text-base">Cover Image</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[1, 2, 3, 4].map(num => (
                        <div 
                          key={num}
                          onClick={() => setSelectedImage(`/images/preset-${num}.png`)}
                          className={`cursor-pointer rounded-md overflow-hidden border-2 transition-all aspect-video ${selectedImage === "/images/preset-" + num + ".png" ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}`}
                        >
                          <img src={`/images/preset-${num}.png`} alt={`Preset ${num}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <Label className="text-base">Title</Label>
                    <Input 
                      value={eventTitle} 
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="font-medium bg-background text-lg"
                      placeholder="e.g., Tech & AI Mixer"
                    />
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <Label className="text-base">Subtitle / Date</Label>
                    <Input 
                      value={eventSubtitle} 
                      onChange={(e) => setEventSubtitle(e.target.value)}
                      className="bg-background"
                      placeholder="e.g., Friday, October 24th @ 6:00 PM"
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border/50">
                    <div className="flex justify-between items-center">
                      <Label className="text-base">Short Description</Label>
                    </div>
                    <Textarea 
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      className="min-h-[120px] font-sans text-sm resize-none bg-background"
                      placeholder="Tell people what the event is about..."
                    />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <Label className="mb-2 block">Live Preview</Label>
                <div className="flex items-center justify-center bg-muted/30 border border-border/50 rounded-xl p-4 sm:p-8 min-h-[600px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                  <Card className="w-full max-w-sm mx-auto shadow-2xl border-0 overflow-hidden bg-background rounded-2xl sm:rounded-[2rem] relative z-10 animate-in zoom-in-95 duration-500">
                    <div className="w-full aspect-square relative bg-muted">
                      {selectedImage ? (
                        <img src={selectedImage} alt="Event Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">Select an image</div>
                      )}
                      <div className="absolute top-4 right-4">
                        <div className="w-10 h-10 bg-background/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm">
                          <Send className="w-5 h-5 text-foreground" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6 sm:p-8 space-y-6">
                      <div className="space-y-2 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance leading-tight">{eventTitle || "Your Event Title"}</h2>
                        <p className="text-primary font-medium">{eventSubtitle || "Date & Time"}</p>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1 pt-2">
                        <div className="flex -space-x-3 justify-center">
                          {[1,2,3,4].map(i => (
                            <div key={i} className="w-9 h-9 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-medium text-secondary-foreground shadow-sm">
                              {String.fromCharCode(64+i)}
                            </div>
                          ))}
                          <div className="w-9 h-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shadow-sm">
                            +42
                          </div>
                        </div>
                        <p className="text-center text-sm text-muted-foreground">46 people attending</p>
                      </div>

                      <div className="pt-4 border-t border-border/50">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{eventDescription || "Your event description will appear here."}</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <Button className="h-12 font-medium rounded-xl shadow-md bg-primary hover:bg-primary/90 text-primary-foreground">
                          RSVP
                        </Button>
                        <Button variant="outline" className="h-12 font-medium rounded-xl shadow-sm bg-background border-border/50">
                          Maybe
                        </Button>
                        <Button variant="outline" className="h-12 font-medium rounded-xl shadow-sm bg-background border-border/50 text-muted-foreground px-0">
                          Not Interested
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-medium">When should we send this?</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Schedule your campaign to maximize open rates.
                  </p>
                </div>
                
                <div className="space-y-4 bg-card border border-border rounded-xl p-5 shadow-sm">
                  <div className="space-y-3">
                    <Label className="text-base">Delivery Channel</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <label 
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${deliveryChannel === 'email' ? 'bg-primary/10 border-primary' : 'bg-background hover:bg-muted/50 border-border/50'}`}
                        onClick={() => setDeliveryChannel('email')}
                      >
                        <Mail className="w-4 h-4" />
                        <span className="font-medium text-sm">Email</span>
                      </label>
                      <label 
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${deliveryChannel === 'sms' ? 'bg-primary/10 border-primary' : 'bg-background hover:bg-muted/50 border-border/50'}`}
                        onClick={() => setDeliveryChannel('sms')}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium text-sm">Text Message</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <Label className="text-base">Send Date</Label>
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="bg-background" />
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-border">
                    <Label className="text-base">Send Time</Label>
                    <Input type="time" defaultValue="10:00" className="bg-background" />
                  </div>
                  
                  <div className="pt-4 border-t border-border flex items-start space-x-3">
                    <Checkbox id="smart-send" defaultChecked className="mt-1" />
                    <Label htmlFor="smart-send" className="font-normal leading-snug cursor-pointer">
                      <strong>Smart Send:</strong> Automatically optimize delivery time based on when students usually check their email.
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="text-center space-y-4 p-8 bg-muted/20 border border-border rounded-xl max-w-sm">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h4 className="font-medium text-lg">Scheduled for Delivery</h4>
                  <p className="text-sm text-muted-foreground mx-auto">
                    The campaign will be queued and sent out in batches to ensure maximum deliverability and engagement.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
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

                  <div className="flex justify-between p-6 hover:bg-muted/10 transition-colors">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Schedule & Channel</div>
                      <div className="font-medium text-lg">Send on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at 10:00 AM via {deliveryChannel === 'email' ? 'Email' : 'Text Message'}</div>
                      <div className="text-sm text-primary mt-1">Smart Send Enabled</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>Edit</Button>
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
