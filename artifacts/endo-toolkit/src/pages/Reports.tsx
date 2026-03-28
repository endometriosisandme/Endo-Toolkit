import { useGetReportSummary } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Printer, AlertTriangle, Pill, Activity } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, parseISO } from "date-fns"

export default function Reports() {
  const { data: report, isLoading } = useGetReportSummary();

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin text-primary">
          <FileText className="h-12 w-12" />
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Unable to load report data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-border pb-6 no-print">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Doctor Report</h1>
          <p className="text-lg text-muted-foreground mt-2">30-day summary ready to share with your healthcare provider.</p>
        </div>
        <Button onClick={handlePrint} className="gap-2 shrink-0">
          <Printer className="h-4 w-4" /> Print / Save PDF
        </Button>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block mb-8 border-b-2 border-foreground pb-4">
        <h1 className="text-3xl font-display font-bold">Endometriosis Toolkit Report</h1>
        <p className="text-lg text-muted-foreground">Generated on {format(new Date(), 'MMMM d, yyyy')}</p>
        <p className="text-sm mt-2"><strong>Period Covered:</strong> Last 30 Days</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-none shadow-md print:shadow-none print:border print:border-border">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Avg Pain</p>
            <p className="text-3xl font-display font-bold text-primary">
              {report.averagePainScore !== null ? report.averagePainScore.toFixed(1) : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-none shadow-md print:shadow-none print:border print:border-border">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Pain Entries</p>
            <p className="text-3xl font-display font-bold text-foreground">{report.totalPainLogs}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-none shadow-md print:shadow-none print:border print:border-border">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Symptoms</p>
            <p className="text-3xl font-display font-bold text-foreground">{report.totalSymptomLogs}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-none shadow-md print:shadow-none print:border print:border-border">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Meds Taken</p>
            <p className="text-3xl font-display font-bold text-foreground">{report.totalMedicationLogs}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:space-y-8">
        
        {/* Most Frequent Symptoms */}
        <Card className="border-none shadow-xl print-break-inside-avoid print:shadow-none print:border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent-foreground" /> 
              Most Frequent Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {report.mostFrequentSymptoms.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.mostFrequentSymptoms} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="symptomType" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 600 }} 
                      width={100}
                      tickFormatter={(val) => val.replace('_', ' ')}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                      {report.mostFrequentSymptoms.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="hsl(var(--accent-foreground))" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No symptom data.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medication Efficacy */}
        <Card className="border-none shadow-xl print-break-inside-avoid print:shadow-none print:border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" /> 
              Medication Usage & Relief
            </CardTitle>
            <CardDescription>Average relief score (1-10) per medication.</CardDescription>
          </CardHeader>
          <CardContent>
            {report.medicationUsage.length > 0 ? (
              <div className="space-y-4">
                {report.medicationUsage.sort((a,b) => b.count - a.count).map((med, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl print:border">
                    <div>
                      <h4 className="font-bold text-foreground">{med.medicationName}</h4>
                      <p className="text-sm text-muted-foreground">Taken {med.count} time{med.count !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Avg Relief</p>
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                        {med.averageRelief.toFixed(1)} / 10
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">No medication data.</div>
            )}
          </CardContent>
        </Card>

      </div>
      
      {/* End of report note */}
      <div className="text-center pt-8 text-sm text-muted-foreground print:block hidden">
        End of Report. Generated securely via EndoToolkit.
      </div>
    </div>
  )
}
