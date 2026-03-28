import { useAuth } from "@workspace/replit-auth-web"
import { Button } from "@/components/ui/button"
import { Activity, HeartPulse, ShieldCheck, Sparkles } from "lucide-react"

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary/30 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-card/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl border border-white/50 text-center flex flex-col items-center">
          
          <div className="h-24 w-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center text-white shadow-xl mb-8 -mt-20 transform -rotate-6">
            <Activity className="h-12 w-12" />
          </div>

          <h1 className="font-display text-4xl font-bold text-foreground mb-4">
            EndoToolkit
          </h1>
          <p className="text-muted-foreground mb-10 text-lg">
            A gentle, supportive space to track your endometriosis journey, recognize patterns, and take control.
          </p>

          <div className="w-full space-y-4 mb-10 text-left">
            <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/60">
              <div className="bg-primary/20 p-2 rounded-xl text-primary"><HeartPulse className="h-5 w-5" /></div>
              <span className="font-semibold text-foreground">Track pain & symptoms daily</span>
            </div>
            <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/60">
              <div className="bg-secondary/30 p-2 rounded-xl text-secondary-foreground"><Sparkles className="h-5 w-5" /></div>
              <span className="font-semibold text-foreground">Monitor medication relief</span>
            </div>
            <div className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-white/60">
              <div className="bg-accent/50 p-2 rounded-xl text-accent-foreground"><ShieldCheck className="h-5 w-5" /></div>
              <span className="font-semibold text-foreground">Generate reports for your doctor</span>
            </div>
          </div>

          <Button size="lg" className="w-full text-lg h-16 shadow-xl" onClick={login}>
            Continue with Replit
          </Button>
          <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Secure, private authentication
          </p>
        </div>
      </div>
    </div>
  );
}
