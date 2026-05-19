"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'

const STATS = [
  { label: 'Active Patients', value: '1,284', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Appointments Today', value: '24', change: '8 left', icon: Calendar, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  { label: 'Retention Rate', value: '94.2%', change: '+2.1%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
  { label: 'Avg Wait Time', value: '12 min', change: '-4 min', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
]

const PATIENT_FLOW_DATA = [
  { name: 'Mon', count: 42 },
  { name: 'Tue', count: 58 },
  { name: 'Wed', count: 45 },
  { name: 'Thu', count: 62 },
  { name: 'Fri', count: 38 },
  { name: 'Sat', count: 20 },
]

const TREATMENT_DATA = [
  { name: 'Cleaning', count: 45, color: 'hsl(var(--primary))' },
  { name: 'Extraction', count: 12, color: 'hsl(var(--secondary))' },
  { name: 'Ortho', count: 28, color: 'hsl(var(--chart-3))' },
  { name: 'Filling', count: 35, color: 'hsl(var(--chart-4))' },
]

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Clinic Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, Dr. Lopez. Here's what's happening today.</p>
        </div>
        <div className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer hover:bg-primary/90 transition-colors">
          <CheckCircle2 size={18} />
          <span className="text-sm font-semibold">Start Morning Shift</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">{stat.change}</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Patient Attendance (Week)</CardTitle>
            <CardDescription>Visualizing patient throughput over the last 6 working days.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PATIENT_FLOW_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Top Treatments</CardTitle>
            <CardDescription>Most requested services this month.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TREATMENT_DATA} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {TREATMENT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Next 3 patients in the queue.</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Elena Gilbert', time: '10:30 AM', treatment: 'Invisalign Follow-up', status: 'In Waitroom' },
                { name: 'Stefan Salvatore', time: '11:15 AM', treatment: 'Root Canal Therapy', status: 'Confirmed' },
                { name: 'Damon Salvatore', time: '12:00 PM', treatment: 'Dental Cleaning', status: 'Pending' },
              ].map((patient, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                      {patient.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{patient.treatment}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{patient.time}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">{patient.status}</p>
                  </div>
                </div>
              ))}
            </CardContent>
         </Card>

         <Card className="bg-primary border-none shadow-xl text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BrainCircuit size={120} />
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit size={20} className="text-secondary" />
                <span className="text-xs font-bold tracking-widest uppercase">Smart Slot Optimizer</span>
              </div>
              <CardTitle className="text-2xl text-white">Optimize Today's Schedule</CardTitle>
              <CardDescription className="text-white/70">Our AI found 3 gaps that can be filled to maximize clinic revenue.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="bg-white/10 rounded-xl p-4 border border-white/20 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-secondary shrink-0" size={18} />
                  <p className="text-sm">Shift the 2:00 PM cleaning to 1:30 PM to create a slot for an urgent crown replacement.</p>
                </div>
              </div>
              <Button className="w-full mt-6 bg-secondary hover:bg-secondary/90 text-white border-none">
                Run Optimization
              </Button>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}