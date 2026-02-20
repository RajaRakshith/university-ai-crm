import { AppLayout } from "@/components/layout";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Events() {
  return (
    <AppLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Events</h1>
            <p className="text-muted-foreground">Manage your center's upcoming programs and target audiences.</p>
          </div>
          <Button className="gap-2 shadow-md"><Plus className="w-4 h-4"/> Create Event</Button>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search events..." 
              className="pl-9 bg-background border-border/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_EVENTS.map(event => (
            <Card key={event.id} className="border-border/50 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
              <div className="h-32 bg-muted/30 border-b border-border/30 p-6 flex flex-col justify-end relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  {event.category.map(cat => (
                    <span key={cat} className="px-2 py-1 bg-background/80 backdrop-blur border border-border/50 rounded-full text-xs font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold font-heading group-hover:text-primary transition-colors">{event.name}</h3>
              </div>
              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-foreground/70" /> {event.date}
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-foreground/70" /> Student Center
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-foreground/70" /> Capacity: {event.capacity}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">0 Campaigns</span>
                  <Button variant="secondary" size="sm">Manage</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
