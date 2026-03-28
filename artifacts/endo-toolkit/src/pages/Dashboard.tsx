import { useGetPainLogs, useGetSymptomLogs, useGetMedicationLogs, useGetReportSummary } from "@workspace/api-client-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Plus, FileText, Droplet, List, Pill } from "lucide-react"
import { Link } from "wouter"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, isToday, parseISO } from "date-fns"

export default function Dashboard() {
  const { data: painLogs, isLoading: painLoading } = useGetPainLogs();
  const { data: symptomLogs, isLoading: symptomLoading } = useGetSymptomLogs();
  const { data: medLogs, isLoading: medLoading } = useGetMedicationLogs();
  const { data: report, isLoading: reportLoading } = useGetReportSummary();

  const isLoading = painLoading || symptomLoading || medLoading || reportLoading;

  // Calculate today's stats
  const todayPainLogs = painLogs?.filter(log => isToday(parseISO(log.date))) || [];
  const todaySymptomLogs = symptomLogs?.filter(log => isToday(parseISO(log.date))) || [];
  const todayMedLogs = medLogs?.filter(log => isToday(parseISO(log.timeTaken))) || [];

  const avgTodayPain = todayPainLogs.length 
    ? Math.round(todayPainLogs.reduce((acc, curr) => acc + curr.painScore, 0) / todayPainLogs.length) 
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin text-primary">
          <Activity className="h-12 w-12" />
        </div>
      </div>
    )
  }

  // Format chart data
  const chartData = [...(report?.painTrend || [])]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(pt => ({
      ...pt,
      displayDate: format(parseISO(pt.date), 'MMM d')
    }));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Welcome Back.</h1>
          <p className="text-lg text-muted-foreground mt-2">Here is your wellness overview for today.</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 snap-x">
          <Link href="/pain" className="snap-start shrink-0">
            <Button variant="default" className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-secondary/20">
              <Plus className="h-4 w-4" /> Log Pain
            </Button>
          </Link>
          <Link href="/symptoms" className="snap-start shrink-0">
            <Button variant="secondary" className="gap-2 bg-primary/10 text-primary hover:bg-primary/20">
              <Plus className="h-4 w-4" /> Log Symptom
            </Button>
          </Link>
        </div>
      </div>

      {/* Today's Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-secondary/40 to-white border-none shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-secondary-foreground/70 mb-1">Today's Pain</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display font-bold text-secondary-foreground">
                  {avgTodayPain !== null ? avgTodayPain : '-'}
                </span>
                <span className="text-muted-foreground font-semibold">/ 10</span>
              </div>
            </div>
            <div className="h-16 w-16 bg-white/50 rounded-2xl flex items-center justify-center text-secondary-foreground shadow-sm">
              <Activity className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/40 to-white border-none shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-accent-foreground/70 mb-1">Symptoms Logged</p>
              <span className="text-5xl font-display font-bold text-accent-foreground">
                {todaySymptomLogs.length}
              </span>
            </div>
            <div className="h-16 w-16 bg-white/50 rounded-2xl flex items-center justify-center text-accent-foreground shadow-sm">
              <List className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/30 to-white border-none shadow-lg">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-primary/70 mb-1">Medications</p>
              <span className="text-5xl font-display font-bold text-primary">
                {todayMedLogs.length}
              </span>
            </div>
            <div className="h-16 w-16 bg-white/50 rounded-2xl flex items-center justify-center text-primary shadow-sm">
              <Pill className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pain Trend Chart */}
      <Card className="border-none shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
        <CardHeader className="pb-2">
          <CardTitle>Pain Trend (30 Days)</CardTitle>
          <CardDescription>Your reported pain levels over the last month.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="painScore" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: 'hsl(var(--card))', strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: 'hsl(var(--secondary))', stroke: 'white' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Activity className="h-12 w-12 opacity-20 mb-4" />
                <p>No pain data for the last 30 days.</p>
                <Link href="/pain" className="text-primary hover:underline mt-2 font-semibold">Log your first entry</Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Action to Reports */}
      <Link href="/reports" className="block">
        <Card className="bg-foreground text-background hover:bg-foreground/90 transition-colors border-none group cursor-pointer">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-4 rounded-full group-hover:scale-110 transition-transform">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Generate Doctor Report</h3>
                <p className="text-white/70">View and print a comprehensive summary of your tracked data.</p>
              </div>
            </div>
            <Activity className="h-6 w-6 text-white/30" />
          </CardContent>
        </Card>
      </Link>

    </div>
  )
}
