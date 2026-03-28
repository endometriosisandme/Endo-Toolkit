import { useState } from "react"
import { useGetPainLogs, useCreatePainLog, useDeletePainLog, getGetPainLogsQueryKey, getGetReportSummaryQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Activity, Plus, Trash2, Calendar, MapPin, Zap } from "lucide-react"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

export default function PainTracker() {
  const queryClient = useQueryClient();
  const { data: logs, isLoading } = useGetPainLogs();
  const createMutation = useCreatePainLog();
  const deleteMutation = useDeletePainLog();

  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [painScore, setPainScore] = useState("5");
  const [painLocation, setPainLocation] = useState("pelvis");
  const [painType, setPainType] = useState("cramping");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        data: {
          date: new Date(date).toISOString(),
          painScore: parseInt(painScore),
          painLocation,
          painType,
          notes: notes || null
        }
      });
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: getGetPainLogsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetReportSummaryQueryKey() });
      setIsFormOpen(false);
      // Reset form
      setPainScore("5");
      setNotes("");
    } catch (err) {
      console.error("Failed to save pain log", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this log?")) {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetPainLogsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetReportSummaryQueryKey() });
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return "bg-accent text-accent-foreground";
    if (score <= 6) return "bg-primary/20 text-primary";
    return "bg-secondary text-secondary-foreground";
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Pain Log</h1>
          <p className="text-lg text-muted-foreground mt-2">Track location, type, and intensity.</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className={cn("transition-transform", isFormOpen && "rotate-45 bg-muted text-foreground hover:bg-muted/80 shadow-none")}>
          <Plus className="h-5 w-5 mr-2" /> {isFormOpen ? "Cancel" : "New Log"}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="border-primary/20 shadow-xl shadow-primary/5 animate-in slide-in-from-top-4 fade-in duration-300">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div>
                  <Label className="flex justify-between">
                    <span>Pain Intensity</span>
                    <span className="text-primary font-display font-bold text-lg">{painScore} / 10</span>
                  </Label>
                  <div className="pt-4 pb-2 px-2">
                    <input 
                      type="range" 
                      min="1" max="10" 
                      value={painScore} 
                      onChange={e => setPainScore(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground px-2">
                    <span>Mild</span>
                    <span>Severe</span>
                  </div>
                </div>
                <div>
                  <Label>Location</Label>
                  <Select 
                    value={painLocation} 
                    onChange={e => setPainLocation(e.target.value)}
                    options={[
                      { value: "pelvis", label: "Pelvis" },
                      { value: "abdomen", label: "Abdomen" },
                      { value: "back", label: "Lower Back" },
                      { value: "legs", label: "Legs" },
                      { value: "other", label: "Other" }
                    ]}
                  />
                </div>
                <div>
                  <Label>Pain Type</Label>
                  <Select 
                    value={painType} 
                    onChange={e => setPainType(e.target.value)}
                    options={[
                      { value: "cramping", label: "Cramping" },
                      { value: "stabbing", label: "Sharp / Stabbing" },
                      { value: "burning", label: "Burning" },
                      { value: "dull", label: "Dull Ache" },
                      { value: "throbbing", label: "Throbbing" }
                    ]}
                  />
                </div>
              </div>
              <div>
                <Label>Additional Notes</Label>
                <Textarea 
                  placeholder="How did it affect your day?" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-14 text-lg" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Save Pain Log"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="font-display text-2xl font-semibold">Recent History</h3>
        
        {isLoading ? (
          <div className="py-12 flex justify-center"><Activity className="h-8 w-8 animate-spin text-primary" /></div>
        ) : !logs || logs.length === 0 ? (
          <Card className="bg-muted/30 border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mb-4 opacity-20" />
              <p>No pain logs found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {logs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
              <Card key={log.id} className="hover:-translate-y-1 transition-transform duration-300">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold">
                      <Calendar className="h-4 w-4" />
                      {format(parseISO(log.date), 'MMMM d, yyyy')}
                    </div>
                    <div className={cn("px-3 py-1 rounded-full font-bold text-sm", getScoreColor(log.painScore))}>
                      {log.painScore} / 10
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <MapPin className="h-4 w-4 text-primary" /> 
                      <span className="capitalize">{log.painLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Zap className="h-4 w-4 text-secondary-foreground" /> 
                      <span className="capitalize">{log.painType}</span>
                    </div>
                  </div>

                  {log.notes && (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl italic mb-4">
                      "{log.notes}"
                    </p>
                  )}

                  <div className="flex justify-end pt-2 border-t border-border">
                    <button 
                      onClick={() => handleDelete(log.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-2"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
