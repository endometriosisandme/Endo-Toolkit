import { useState } from "react"
import { useGetSymptomLogs, useCreateSymptomLog, useDeleteSymptomLog, getGetSymptomLogsQueryKey, getGetReportSummaryQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { List, Plus, Trash2, Calendar, AlertCircle } from "lucide-react"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

export default function SymptomTracker() {
  const queryClient = useQueryClient();
  const { data: logs, isLoading } = useGetSymptomLogs();
  const createMutation = useCreateSymptomLog();
  const deleteMutation = useDeleteSymptomLog();

  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [severity, setSeverity] = useState("5");
  const [symptomType, setSymptomType] = useState("fatigue");
  const [triggers, setTriggers] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        data: {
          date: new Date(date).toISOString(),
          severity: parseInt(severity),
          symptomType,
          triggers: triggers || null,
          notes: notes || null
        }
      });
      queryClient.invalidateQueries({ queryKey: getGetSymptomLogsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetReportSummaryQueryKey() });
      setIsFormOpen(false);
      setSeverity("5");
      setTriggers("");
      setNotes("");
    } catch (err) {
      console.error("Failed to save symptom log", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this log?")) {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetSymptomLogsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetReportSummaryQueryKey() });
    }
  };

  const symptomOptions = [
    { value: "fatigue", label: "Fatigue / Exhaustion" },
    { value: "nausea", label: "Nausea" },
    { value: "bloating", label: "Bloating (Endo Belly)" },
    { value: "pelvic_pain", label: "Pelvic Pain (Non-period)" },
    { value: "back_pain", label: "Back Pain" },
    { value: "headache", label: "Headache / Migraine" },
    { value: "brain_fog", label: "Brain Fog" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Symptoms</h1>
          <p className="text-lg text-muted-foreground mt-2">Log associated symptoms & triggers.</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className={cn("transition-transform", isFormOpen && "rotate-45 bg-muted text-foreground hover:bg-muted/80 shadow-none")}>
          <Plus className="h-5 w-5 mr-2" /> {isFormOpen ? "Cancel" : "Add"}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="border-accent shadow-xl shadow-accent/10 animate-in slide-in-from-top-4 fade-in duration-300">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div>
                  <Label>Symptom Type</Label>
                  <Select 
                    value={symptomType} 
                    onChange={e => setSymptomType(e.target.value)}
                    options={symptomOptions}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="flex justify-between">
                    <span>Severity</span>
                    <span className="text-accent-foreground font-display font-bold text-lg">{severity} / 10</span>
                  </Label>
                  <div className="pt-4 pb-2 px-2">
                    <input 
                      type="range" 
                      min="1" max="10" 
                      value={severity} 
                      onChange={e => setSeverity(e.target.value)}
                      className="w-full accent-slider"
                      style={{ '--tw-accent': 'hsl(var(--accent-foreground))' } as React.CSSProperties}
                    />
                  </div>
                </div>
                <div>
                  <Label>Possible Triggers</Label>
                  <Input 
                    placeholder="e.g., specific food, stress, lack of sleep" 
                    value={triggers} 
                    onChange={e => setTriggers(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input 
                    placeholder="Details..." 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full h-14 text-lg bg-accent-foreground text-white hover:bg-accent-foreground/90 shadow-accent-foreground/20" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Save Symptom"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="font-display text-2xl font-semibold">Recent Symptoms</h3>
        
        {isLoading ? (
          <div className="py-12 flex justify-center"><Activity className="h-8 w-8 animate-spin text-accent-foreground" /></div>
        ) : !logs || logs.length === 0 ? (
          <Card className="bg-muted/30 border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <List className="h-12 w-12 mb-4 opacity-20" />
              <p>No symptoms logged yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {logs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => {
              const typeLabel = symptomOptions.find(o => o.value === log.symptomType)?.label || log.symptomType;
              
              return (
                <Card key={log.id} className="hover:-translate-y-1 transition-transform duration-300 border-l-4" style={{ borderLeftColor: 'hsl(var(--accent-foreground))' }}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-foreground">{typeLabel}</h4>
                      <div className="bg-accent/30 text-accent-foreground px-2 py-0.5 rounded-md font-bold text-xs">
                        Lvl {log.severity}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-4">
                      <Calendar className="h-3 w-3" />
                      {format(parseISO(log.date), 'MMM d, yyyy')}
                    </div>

                    {log.triggers && (
                      <div className="flex items-start gap-2 mb-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                        <span className="text-foreground"><span className="font-semibold">Trigger:</span> {log.triggers}</span>
                      </div>
                    )}

                    {log.notes && (
                      <p className="text-sm text-muted-foreground italic mb-2 line-clamp-2">
                        "{log.notes}"
                      </p>
                    )}

                    <div className="flex justify-end mt-2 pt-2 border-t border-border/50">
                      <button 
                        onClick={() => handleDelete(log.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
