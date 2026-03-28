import { useState } from "react"
import { useGetMedicationLogs, useCreateMedicationLog, useDeleteMedicationLog, getGetMedicationLogsQueryKey, getGetReportSummaryQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pill, Plus, Trash2, Clock, CheckCircle2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

export default function MedicationTracker() {
  const queryClient = useQueryClient();
  const { data: logs, isLoading } = useGetMedicationLogs();
  const createMutation = useCreateMedicationLog();
  const deleteMutation = useDeleteMedicationLog();

  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form State
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const [timeTaken, setTimeTaken] = useState(now.toISOString().slice(0, 16)); // YYYY-MM-DDThh:mm
  const [medicationName, setMedicationName] = useState("");
  const [dose, setDose] = useState("");
  const [reliefLevel, setReliefLevel] = useState("5");
  const [sideEffects, setSideEffects] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        data: {
          timeTaken: new Date(timeTaken).toISOString(),
          medicationName,
          dose,
          reliefLevel: parseInt(reliefLevel),
          sideEffects: sideEffects || null
        }
      });
      queryClient.invalidateQueries({ queryKey: getGetMedicationLogsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetReportSummaryQueryKey() });
      setIsFormOpen(false);
      setMedicationName("");
      setDose("");
      setReliefLevel("5");
      setSideEffects("");
    } catch (err) {
      console.error("Failed to save medication log", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this log?")) {
      await deleteMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetMedicationLogsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetReportSummaryQueryKey() });
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Medications</h1>
          <p className="text-lg text-muted-foreground mt-2">Track what you took and if it helped.</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className={cn("bg-primary text-primary-foreground transition-transform", isFormOpen && "rotate-45 bg-muted text-foreground hover:bg-muted/80 shadow-none")}>
          <Plus className="h-5 w-5 mr-2" /> {isFormOpen ? "Cancel" : "Add Dose"}
        </Button>
      </div>

      {isFormOpen && (
        <Card className="border-primary shadow-xl shadow-primary/10 animate-in slide-in-from-top-4 fade-in duration-300">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Date & Time Taken</Label>
                  <Input type="datetime-local" value={timeTaken} onChange={e => setTimeTaken(e.target.value)} required />
                </div>
                <div>
                  <Label>Medication Name</Label>
                  <Input 
                    placeholder="e.g., Ibuprofen, Naproxen, specific Rx" 
                    value={medicationName} 
                    onChange={e => setMedicationName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Dose</Label>
                  <Input 
                    placeholder="e.g., 400mg, 2 pills" 
                    value={dose} 
                    onChange={e => setDose(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label className="flex justify-between">
                    <span>Relief Level</span>
                    <span className="text-primary font-display font-bold text-lg">{reliefLevel} / 10</span>
                  </Label>
                  <div className="pt-4 pb-2 px-2">
                    <input 
                      type="range" 
                      min="1" max="10" 
                      value={reliefLevel} 
                      onChange={e => setReliefLevel(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground px-2">
                    <span>No Relief</span>
                    <span>Complete Relief</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label>Side Effects (if any)</Label>
                  <Textarea 
                    placeholder="Did you feel dizzy, nauseous, etc.?" 
                    value={sideEffects} 
                    onChange={e => setSideEffects(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full h-14 text-lg bg-primary hover:bg-primary/90" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Save Medication Log"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="font-display text-2xl font-semibold">Dose History</h3>
        
        {isLoading ? (
          <div className="py-12 flex justify-center"><Pill className="h-8 w-8 animate-spin text-primary" /></div>
        ) : !logs || logs.length === 0 ? (
          <Card className="bg-muted/30 border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Pill className="h-12 w-12 mb-4 opacity-20" />
              <p>No medications logged yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {logs.sort((a,b) => new Date(b.timeTaken).getTime() - new Date(a.timeTaken).getTime()).map(log => (
              <Card key={log.id} className="hover:-translate-y-0.5 transition-transform duration-300">
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Pill className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                        {log.medicationName} 
                        <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{log.dose}</span>
                      </h4>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                        <Clock className="h-3.5 w-3.5" />
                        {format(parseISO(log.timeTaken), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                    <div className="flex flex-col items-start md:items-end">
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Relief</span>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className={cn("h-4 w-4", log.reliefLevel >= 7 ? "text-green-500" : log.reliefLevel >= 4 ? "text-yellow-500" : "text-destructive")} />
                        <span className="font-bold">{log.reliefLevel}/10</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDelete(log.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors bg-muted/50 p-2 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {log.sideEffects && (
                    <div className="w-full text-sm text-destructive-foreground bg-destructive/10 p-3 rounded-xl mt-2 md:hidden">
                      <span className="font-semibold">Side effect:</span> {log.sideEffects}
                    </div>
                  )}

                </CardContent>
                {/* Desktop Side Effects */}
                {log.sideEffects && (
                  <div className="hidden md:block px-4 pb-4 pt-0">
                     <div className="w-full text-sm text-destructive-foreground bg-destructive/10 p-3 rounded-xl">
                      <span className="font-semibold">Side effect:</span> {log.sideEffects}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
