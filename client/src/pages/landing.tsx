import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold mb-8 shadow-xl">
        U
      </div>
      <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight max-w-4xl text-balance">
        Intelligent targeting for University Centers.
      </h1>
      <p className="text-xl text-muted-foreground mb-10 max-w-2xl text-balance">
        Automatically understand each student’s interests using resume data, club history, and coursework to recruit the right students into the right programs.
      </p>
      <div className="flex gap-4">
        <Link href="/app">
          <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
            Enter Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
